import { ApiError } from "../../shared/utils/ApiError.js";
import { setCache, deleteCache } from "../../../infrastructure/cache/redis.js";
import * as reservationRepo from "../repository/reservationRepository.js";
import { calculateActivePrice } from "../../shared/utils/priceCalculator.js";
import { roomTypes } from "../../../infrastructure/db/schema/room_types.js";
import { db } from "../../../infrastructure/db/connection.js";
import { discounts } from "../../../infrastructure/db/schema/discount.js";
import { eq } from "drizzle-orm";
import { sendReservationCancelledEmail } from "../../email/service/emailService.js";

const HOLD_TTL = 60 * 15; // 15 minutes in seconds
const CANCELLATION_WINDOW_HOURS = 48;

// ── HELPERS ───────────────────────────────────────────────

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights;
};

const calculateTotalPrice = async (
  roomTypeId: string,
  nights: number,
): Promise<string> => {
  const [roomType] = await db
    .select({
      basePrice: roomTypes.basePrice,
      discountType: discounts.type,
      discountValue: discounts.value,
      discountStartDate: discounts.startDate,
      discountEndDate: discounts.endDate,
    })
    .from(roomTypes)
    .leftJoin(discounts, eq(discounts.id, roomTypes.discount_id))
    .where(eq(roomTypes.id, roomTypeId))
    .limit(1);

  if (!roomType) throw new ApiError(404, "Room type not found.");

  const discount = roomType.discountType
    ? {
        type: roomType.discountType,
        value: roomType.discountValue!,
        startDate: roomType.discountStartDate!,
        endDate: roomType.discountEndDate!,
      }
    : null;

  const pricePerNight = calculateActivePrice({
    basePrice: roomType.basePrice,
    discount,
  });

  return (pricePerNight * nights).toFixed(2);
};

// ── GUEST ─────────────────────────────────────────────────

export const createReservationService = async (
  userId: string,
  data: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
  },
) => {
  // 1. Validate dates
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
  }

  if (checkInDate < today) {
    throw new ApiError(400, "Check-in date cannot be in the past.");
  }

  if (checkOutDate <= checkInDate) {
    throw new ApiError(400, "Check-out must be after check-in.");
  }

  // 2. Find an available room
  const availableRoom = await reservationRepo.findAvailableRoom(
    data.roomTypeId,
    data.checkIn,
    data.checkOut,
  );

  if (!availableRoom) {
    throw new ApiError(
      409,
      "No rooms available for the selected dates. Please try different dates.",
    );
  }

  // 3. Calculate total price
  const nights = calculateNights(data.checkIn, data.checkOut);
  const totalPrice = await calculateTotalPrice(data.roomTypeId, nights);

  // 4. Set 15-minute expiry window
  const expiresAt = new Date(Date.now() + HOLD_TTL * 1000);

  // 5. Create the reservation
  const reservation = await reservationRepo.createReservation({
    userId,
    roomId: availableRoom.id,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    totalPrice,
    expiresAt,
  });

  if (!reservation) {
    throw new ApiError(500, "Failed to create reservation. Please try again.");
  }

  // 6. Store hold in Redis with 15-min TTL
  await setCache(
    `reservation:hold:${reservation.id}`,
    { reservationId: reservation.id, userId, expiresAt },
    HOLD_TTL,
  );

  return {
    ...reservation,
    nights,
    totalPrice,
    expiresAt,
    holdExpiresInSeconds: HOLD_TTL,
  };
};

export const getMyReservationsService = async (userId: string) => {
  return await reservationRepo.findMyReservations(userId);
};

export const getMyReservationByIdService = async (
  reservationId: string,
  userId: string,
) => {
  const reservation = await reservationRepo.findMyReservationById(
    reservationId,
    userId,
  );

  if (!reservation) {
    throw new ApiError(404, "Reservation not found.");
  }

  return reservation;
};

export const cancelMyReservationService = async (
  reservationId: string,
  userId: string,
) => {
  // 1. Confirm ownership
  const reservation = await reservationRepo.findMyReservationById(
    reservationId,
    userId,
  );

  if (!reservation) {
    throw new ApiError(404, "Reservation not found.");
  }

  // 2. Can only cancel PENDING or PAID reservations
  if (!["PENDING", "PAID"].includes(reservation.status)) {
    throw new ApiError(
      400,
      `Cannot cancel a reservation with status: ${reservation.status}.`,
    );
  }

  // 3. Enforce 48-hour cancellation window
  const checkInDate = new Date(reservation.checkIn);
  const now = new Date();
  const hoursUntilCheckIn =
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < CANCELLATION_WINDOW_HOURS) {
    throw new ApiError(
      400,
      `Cancellation is only allowed up to ${CANCELLATION_WINDOW_HOURS} hours before check-in.`,
    );
  }

  // 4. Cancel and clear Redis hold
  const cancelled = await reservationRepo.cancelReservation(reservationId);
  await deleteCache(`reservation:hold:${reservationId}`);

  // Send cancellation email
  await sendReservationCancelledEmail({
    reservationId,
    cancelledBy: "GUEST",
    refundAmount: null,
    refundEligible: false,
  });
  console.log("Cancellation email sent successfully");

  return cancelled;
};

// ── PROPRIETOR ────────────────────────────────────────────

export const getPropertyReservationsService = async (
  propertyId: string,
  ownerId: string,
) => {
  // Confirm ownership first
  const property = await reservationRepo.findPropertyByIdAndOwner(
    propertyId,
    ownerId,
  );

  if (!property) {
    throw new ApiError(404, "Property not found or access denied.");
  }

  return await reservationRepo.findReservationsByProperty(propertyId);
};

export const cancelReservationOverrideService = async (
  reservationId: string,
  cancelledBy: "PROPRIETOR" | "ADMIN",
) => {
  const reservation = await reservationRepo.findReservationById(reservationId);

  if (!reservation) {
    throw new ApiError(404, "Reservation not found.");
  }

  if (["CANCELLED", "EXPIRED", "CHECKED_OUT"].includes(reservation.status)) {
    throw new ApiError(
      400,
      `Cannot cancel a reservation with status: ${reservation.status}.`,
    );
  }

  const cancelled = await reservationRepo.cancelReservation(reservationId);
  await deleteCache(`reservation:hold:${reservationId}`);

  // Send email
  await sendReservationCancelledEmail({
    reservationId,
    cancelledBy,
    refundAmount: null,
    refundEligible: false,
  });
  return cancelled;
};

// ── ADMIN ─────────────────────────────────────────────────

export const getAllReservationsService = async () => {
  return await reservationRepo.findAllReservations();
};

export const updateReservationStatusService = async (
  reservationId: string,
  status:
    | "PENDING"
    | "PAID"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "EXPIRED",
) => {
  const reservation = await reservationRepo.findReservationById(reservationId);

  if (!reservation) {
    throw new ApiError(404, "Reservation not found.");
  }

  const updated = await reservationRepo.updateReservationStatus(
    reservationId,
    status,
  );

  if (!updated) {
    throw new ApiError(500, "Status update failed. Please try again.");
  }

  return updated;
};

// ── EXPIRY POLLING JOB ────────────────────────────────────
// Called by a background job every few minutes
// Finds all PENDING reservations past their expiresAt and marks them EXPIRED

export const expireStaleReservationsService = async () => {
  const stale = await reservationRepo.findStaleReservations();

  if (stale.length === 0) return { expired: 0 };

  for (const reservation of stale) {
    await reservationRepo.updateReservationStatus(reservation.id, "EXPIRED");
    await deleteCache(`reservation:hold:${reservation.id}`);
  }

  return { expired: stale.length };
};

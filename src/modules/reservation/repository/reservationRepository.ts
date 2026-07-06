import { and, eq, gte, isNull, lte, ne, not, exists, sql } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { reservations } from "../../../infrastructure/db/schema/reservation.js";
import { rooms } from "../../../infrastructure/db/schema/rooms.js";
import { roomTypes } from "../../../infrastructure/db/schema/room_types.js";
import { properties } from "../../../infrastructure/db/schema/properties.js";

// ── SHARED ────────────────────────────────────────────────

import { lt } from "drizzle-orm";

export const findStaleReservations = async () => {
  return await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.status, "PENDING"),
        lt(reservations.expiresAt, new Date()),
      )
    );
};

// Finds one available room of a given room type for the requested dates
export const findAvailableRoom = async (
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
) => {
  const [availableRoom] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(
      and(
        eq(rooms.roomTypeId, roomTypeId),
        eq(rooms.is_available, true),
        not(
          exists(
            db
              .select({ id: reservations.id })
              .from(reservations)
              .where(
                and(
                  eq(reservations.roomId, rooms.id),
                  // Only active reservations block a room
                  // EXPIRED and CANCELLED do not block
                  ne(reservations.status, "EXPIRED"),
                  ne(reservations.status, "CANCELLED"),
                  // Date overlap check
                  lte(reservations.checkIn, checkOut),
                  gte(reservations.checkOut, checkIn),
                ),
              ),
          ),
        ),
      ),
    )
    .limit(1);

  return availableRoom ?? null;
};

// ── GUEST ─────────────────────────────────────────────────

export const createReservation = async (data: {
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  expiresAt: Date;
}) => {
  const [newReservation] = await db
    .insert(reservations)
    .values({
      userId: data.userId,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      totalPrice: data.totalPrice,
      expiresAt: data.expiresAt,
      status: "PENDING",
    })
    .returning();

  return newReservation;
};

export const findMyReservations = async (userId: string) => {
  return await db
    .select({
      id: reservations.id,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      totalPrice: reservations.totalPrice,
      expiresAt: reservations.expiresAt,
      createdAt: reservations.createdAt,
      roomId: reservations.roomId,
    })
    .from(reservations)
    .where(eq(reservations.userId, userId))
    .orderBy(reservations.createdAt);
};

export const findMyReservationById = async (
  reservationId: string,
  userId: string,
) => {
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.id, reservationId),
        eq(reservations.userId, userId),
      ),
    )
    .limit(1);

  return reservation ?? null;
};

export const cancelReservation = async (reservationId: string) => {
  const [cancelled] = await db
    .update(reservations)
    .set({ status: "CANCELLED" })
    .where(eq(reservations.id, reservationId))
    .returning();

  return cancelled ?? null;
};

export const findReservationById = async (reservationId: string) => {
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);

  return reservation ?? null;
};

// ── PROPRIETOR ────────────────────────────────────────────

export const findReservationsByProperty = async (propertyId: string) => {
  return await db
    .select({
      id: reservations.id,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      totalPrice: reservations.totalPrice,
      expiresAt: reservations.expiresAt,
      createdAt: reservations.createdAt,
      roomId: reservations.roomId,
      userId: reservations.userId,
    })
    .from(reservations)
    .innerJoin(rooms, eq(rooms.id, reservations.roomId))
    .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
    .where(eq(roomTypes.property_id, propertyId))
    .orderBy(reservations.createdAt);
};

// Confirms the property belongs to this proprietor
export const findPropertyByIdAndOwner = async (
  propertyId: string,
  ownerId: string,
) => {
  const [property] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.ownerId, ownerId),
        isNull(properties.deleted_at),
      ),
    )
    .limit(1);

  return property ?? null;
};

// ── ADMIN ─────────────────────────────────────────────────

export const findAllReservations = async () => {
  return await db
    .select({
      id: reservations.id,
      status: reservations.status,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      totalPrice: reservations.totalPrice,
      expiresAt: reservations.expiresAt,
      createdAt: reservations.createdAt,
      roomId: reservations.roomId,
      userId: reservations.userId,
    })
    .from(reservations)
    .orderBy(reservations.createdAt);
};

export const updateReservationStatus = async (
  reservationId: string,
  status: "PENDING" | "PAID" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "EXPIRED",
) => {
  const [updated] = await db
    .update(reservations)
    .set({ status })
    .where(eq(reservations.id, reservationId))
    .returning();

  return updated ?? null;
};
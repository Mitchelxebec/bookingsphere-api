import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { reviews } from "../../../infrastructure/db/schema/reviews.js";
import { roomTypes } from "../../../infrastructure/db/schema/room_types.js";
import { reservations } from "../../../infrastructure/db/schema/reservation.js";
import { rooms } from "../../../infrastructure/db/schema/rooms.js";

// SHARED
export const findReviewByReservationId = async (reservationId: string) => {
  const [result] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.reservationId, reservationId))
    .limit(1);

  return result ?? null;
};

export const findPropertyIdByReservationId = async (reservationId: string) => {
  const [result] = await db
    .select({ propertyId: roomTypes.property_id })
    .from(reservations)
    .innerJoin(rooms, eq(rooms.id, reservations.roomId))
    .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
    .where(eq(reservations.id, reservationId))
    .limit(1);

  return result ?? null;
};

// GUEST
export const findReviewsByPropertyId = async (
  propertyId: string,
  limit: number,
  offset: number,
) => {
  const result = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.propertyId, propertyId),
        isNull(reviews.deleted_at),
        eq(reviews.reviewStatus, "ACTIVE"),
      ),
    )
    .limit(limit)
    .offset(offset);

  return result ?? null;
};

interface CreateReviewInput {
  propertyId: string;
  userId: string;
  reservationId: string;
  rating: number;
  comment: string;
}
export const createReview = async (data: CreateReviewInput) => {
  const [review] = await db
    .insert(reviews)
    .values({
      propertyId: data.propertyId,
      userId: data.userId,
      reservationId: data.reservationId,
      rating: data.rating,
      comment: data.comment,
    })
    .returning();

  return review ?? null;
};

// PROPRIETOR
export const findReviewById = async (id: string) => {
  const [result] = await db.select().from(reviews).where(eq(reviews.id, id));

  return result ?? null;
};

export const createResponse = async (response: string, reviewId: string) => {
  const [result] = await db
    .update(reviews)
    .set({ response: response, isLocked: true })
    .where(eq(reviews.id, reviewId))
    .returning();

  return result ?? null;
};

export const flagReview = async (
  reviewId: string,
  reportedBy: string,
  flagReason: string,
) => {
  const [result] = await db
    .update(reviews)
    .set({ reviewStatus: "FLAGGED", reportedBy, flagReason })
    .where(eq(reviews.id, reviewId))
    .returning();

  return result ?? null;
};

// ADMIN
export const findFlaggedReviews = async () => {
  return await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.reviewStatus, "FLAGGED"), isNull(reviews.deleted_at)),
    );
};

export const softDeleteReview = async (reviewId: string) => {
  const [result] = await db
    .update(reviews)
    .set({ is_deleted: true, deleted_at: new Date(), reviewStatus: "REMOVED" })
    .where(and(eq(reviews.id, reviewId)))
    .returning();

  return result ?? null;
};

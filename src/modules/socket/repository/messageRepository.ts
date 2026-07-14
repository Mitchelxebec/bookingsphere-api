import { and, eq, ne } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { properties } from "../../../infrastructure/db/schema/properties.js";
import { reservations } from "../../../infrastructure/db/schema/reservation.js";
import { rooms } from "../../../infrastructure/db/schema/rooms.js";
import { roomTypes } from "../../../infrastructure/db/schema/room_types.js";
import { messages } from "../../../infrastructure/db/schema/messages.js";

export const getReservationInfo = async (reservationId: string) => {
  const [reservationData] = await db
    .select({
      guestId: reservations.userId,
      ownerId: properties.ownerId, // The proprietor who owns the room
    })
    .from(reservations)
    .innerJoin(rooms, eq(reservations.roomId, rooms.id))
    .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
    .innerJoin(properties, eq(roomTypes.property_id, properties.id))
    .where(eq(reservations.id, reservationId))
    .limit(1);

  return reservationData ?? null;
};

interface SaveMessage {
  reservationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
}
export const saveMessage = async (data: SaveMessage) => {
  const [save] = await db
    .insert(messages)
    .values({
      reservationId: data.reservationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      createdAt: data.createdAt,
    })
    .returning();

  return save ?? null;
};

export const getMessagesByRoom = async (reservationId: string) => {
  return db
    .select()
    .from(messages)
    .where(eq(messages.reservationId, reservationId))
    .orderBy(messages.createdAt);
};

export const markMessagesAsRead = async (reservationId: string, sessionId: string) => {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.reservationId, reservationId),
        ne(messages.senderId, sessionId),
        eq(messages.isRead, false),
      ),
    );
};

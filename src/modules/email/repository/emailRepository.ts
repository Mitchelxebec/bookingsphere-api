import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../../infrastructure/db/connection.js";
import { properties } from "../../../infrastructure/db/schema/properties.js";
import { reservations } from "../../../infrastructure/db/schema/reservation.js";
import { rooms } from "../../../infrastructure/db/schema/rooms.js";
import { users } from "../../../infrastructure/db/schema/users.js";
import { roomTypes } from "../../../infrastructure/db/schema/room_types.js";

const guest = alias(users, "guest");
const proprietor = alias(users, "proprietor");

export const findBookingEmailData = async (reservationId: string) => {
  const [result] = await db
    .select({
      guestName: guest.name,
      guestEmail: guest.email,
      // guestRole: guest.roles,
      reservationId: reservations.id,
      roomId: reservations.roomId,
      checkIn: reservations.checkIn,
      checkOut: reservations.checkOut,
      totalPrice: reservations.totalPrice,
      cancellationDate: reservations.createdAt,
      roomTypeId: roomTypes.id,
      propertyName: properties.name,
      propertyLocation: properties.location,
      propertyCity: properties.city,
      proprietorName: proprietor.name,
      proprietorEmail: proprietor.email,
      proprietorPhone: proprietor.phone,
    })
    .from(reservations)
    .innerJoin(guest, eq(reservations.userId, guest.id))
    .innerJoin(rooms, eq(reservations.roomId, rooms.id))
    .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
    .innerJoin(properties, eq(roomTypes.property_id, properties.id))
    .innerJoin(proprietor, eq(properties.ownerId, proprietor.id))
    .where(eq(reservations.id, reservationId))
    .limit(1);

  return result ?? null;
};

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { roomTypes } from "../../../../infrastructure/db/schema/room_types.js";
import { properties } from "../../../../infrastructure/db/schema/properties.js";

// List all active room types for a given property
export const findRoomTypesByProperty = async (propertyId: string) => {
  return await db
    .select()
    .from(roomTypes)
    .where(
      and(eq(roomTypes.property_id, propertyId), isNull(roomTypes.deleted_at)),
    );
};

// Ownership check: confirms the room type exists, isn't deleted,
// AND belongs to a property owned by this proprietor
export const findRoomTypeByIdAndOwner = async (
  roomTypeId: string,
  ownerId: string,
) => {
  const [result] = await db
    .select({
      id: roomTypes.id,
      property_id: roomTypes.property_id,
      name: roomTypes.name,
      basePrice: roomTypes.basePrice,
      capacity: roomTypes.capacity,
      description: roomTypes.description,
    })
    .from(roomTypes)
    .innerJoin(properties, eq(properties.id, roomTypes.property_id))
    .where(
      and(
        eq(roomTypes.id, roomTypeId),
        eq(properties.ownerId, ownerId),
        isNull(roomTypes.deleted_at),
      ),
    )
    .limit(1);

  return result ?? null;
};

// Confirms the parent property exists, isn't deleted, and belongs to this owner
// (used before creating a new room type under it)
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

export const createRoomType = async (data: {
  property_id: string;
  name: string;
  basePrice: string;
  capacity: number;
  description?: string;
}) => {
  const [newRoomType] = await db.insert(roomTypes).values(data).returning();

  return newRoomType;
};

export const updateRoomType = async (
  roomTypeId: string,
  data: {
    name?: string;
    basePrice?: string;
    capacity?: number;
    description?: string;
  },
) => {
  const [updated] = await db
    .update(roomTypes)
    .set(data)
    .where(and(eq(roomTypes.id, roomTypeId), isNull(roomTypes.deleted_at)))
    .returning();

  return updated ?? null;
};

export const softDeleteRoomType = async (roomTypeId: string) => {
  const [deleted] = await db
    .update(roomTypes)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .where(and(eq(roomTypes.id, roomTypeId), isNull(roomTypes.deleted_at)))
    .returning();

  return deleted ?? null;
};

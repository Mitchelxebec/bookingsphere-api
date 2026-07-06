import { and, eq, isNull } from "drizzle-orm";
import { properties } from "../../../../infrastructure/db/schema/properties.js";
import { db } from "../../../../infrastructure/db/connection.js";

export const findAllPending = async () => {
  return await db
    .select({
      id: properties.id,
      name: properties.name,
      propertyType: properties.property_type,
      location: properties.location,
      city: properties.city,
      country: properties.country,
      imageUrl: properties.imageUrl,
      approvalStatus: properties.approvalStatus,
      createdAt: properties.createdAt,
      ownerId: properties.ownerId,
    })
    .from(properties)
    .where(
      and(
        eq(properties.approvalStatus, "PENDING"),
        isNull(properties.deleted_at),
      ),
    );
};

export const approveProperty = async (propertyId: string) => {
  const [approved] = await db
    .update(properties)
    .set({
      approvalStatus: "APPROVED",
      rejection_reason: null,
    })
    .where(and(eq(properties.id, propertyId), isNull(properties.deleted_at)))
    .returning();

  return approved ?? null;
};

export const rejectProperty = async (
  propertyId: string,
  rejectionReason: string,
) => {
  const [rejected] = await db
    .update(properties)
    .set({
      approvalStatus: "REJECTED",
      rejection_reason: rejectionReason,
    })
    .where(and(eq(properties.id, propertyId), isNull(properties.deleted_at)))
    .returning();

  return rejected ?? null;
};

export const forceDeleteProperty = async (propertyId: string) => {
  const [deleted] = await db
    .update(properties)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .where(and(eq(properties.id, propertyId), isNull(properties.deleted_at)))
    .returning();

  return deleted ?? null;
};

export const findPropertyById = async (propertyId: string) => {
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), isNull(properties.deleted_at)))
    .limit(1);

  return property ?? null;
};

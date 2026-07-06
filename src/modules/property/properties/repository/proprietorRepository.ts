import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { properties } from "../../../../infrastructure/db/schema/properties.js";

export const findMyListings = async (ownerId: string) => {
  return await db
    .select({
      id: properties.id,
      name: properties.name,
      propertyType: properties.property_type,
      location: properties.location,
      city: properties.city,
      country: properties.country,
      imageUrl: properties.imageUrl,
      description: properties.description,
      approvalStatus: properties.approvalStatus,
      rejectionReason: properties.rejection_reason,
      isDeleted: properties.is_deleted,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .where(and(eq(properties.ownerId, ownerId), isNull(properties.deleted_at)));
};

export const createProperty = async (data: {
  name: string;
  property_type: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
  location: string;
  city: string;
  country: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
}) => {
  const [newProperty] = await db
    .insert(properties)
    .values({
      name: data.name,
      property_type: data.property_type,
      location: data.location,
      city: data.city,
      country: data.country,
      description: data.description,
      imageUrl: data.imageUrl,
      ownerId: data.ownerId,
    })
    .returning();

  return newProperty;
};

export const updateProperty = async (
  propertyId: string,
  ownerId: string,
  data: {
    name?: string;
    property_type?: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
    location?: string;
    city?: string;
    country?: string;
    description?: string;
    imageUrl?: string;
  },
) => {
  // Check if any sensitive field is being changed
  const sensitiveFields = [
    "name",
    "property_type",
    "location",
    "city",
    "country",
    "imageUrl",
  ] as const;

  const needsReApproval = sensitiveFields.some(
    (field) => data[field] !== undefined,
  );

  const [updated] = await db
    .update(properties)
    .set({
      ...data,
      // If a sensitive field changed, flip back to PENDING
      ...(needsReApproval && {
        approvalStatus: "PENDING",
        rejection_reason: null,
      }),
    })
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.ownerId, ownerId),
        isNull(properties.deleted_at),
      ),
    )
    .returning();

  return updated ?? null;
};

export const softDeleteProperty = async (
  propertyId: string,
  ownerId: string,
) => {
  const [deleted] = await db
    .update(properties)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
    })
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.ownerId, ownerId),
        isNull(properties.deleted_at),
      ),
    )
    .returning();

  return deleted ?? null;
};

export const findPropertyByIdAndOwner = async (
  propertyId: string,
  ownerId: string,
) => {
  const [property] = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.ownerId, ownerId),
        isNull(properties.deleted_at),
      )
    )
    .limit(1);

  return property ?? null;
};
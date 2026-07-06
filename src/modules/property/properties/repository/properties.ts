import { and, eq } from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { properties } from "../../../../infrastructure/db/schema/index.js";

export const getProperietorProps = async (
  propertyId: string,
  userId: string,
) => {
  return await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, userId)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
};

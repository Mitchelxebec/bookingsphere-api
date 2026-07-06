import { eq, and } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { wishlist } from "../../../infrastructure/db/schema/wishlist.js";
import { properties } from "../../../infrastructure/db/schema/properties.js";
import { sql } from "drizzle-orm";

export const addToWishlist = async (userId: string, propertyId: string) => {
  const [result] = await db
    .insert(wishlist)
    .values({ user_id: userId, property_id: propertyId })
    .onConflictDoNothing()
    .returning();

  // result is undefined if conflict occurred (already wishlisted)
  // that's fine — we return a consistent shape either way
  return result ?? { user_id: userId, property_id: propertyId };
};

export const removeFromWishlist = async (
  userId: string,
  propertyId: string,
) => {
  const [removed] = await db
    .delete(wishlist)
    .where(
      and(
        eq(wishlist.user_id, userId),
        eq(wishlist.property_id, propertyId),
      ),
    )
    .returning();

  return removed ?? null;
};

export const getMyWishlist = async (userId: string) => {
  return await db
    .select({
      wishlistId: wishlist.id,
      propertyId: properties.id,
      propertyName: properties.name,
      propertyType: properties.property_type,
      location: properties.location,
      city: properties.city,
      country: properties.country,
      imageUrl: properties.imageUrl,
      approvalStatus: properties.approvalStatus,
    })
    .from(wishlist)
    .innerJoin(properties, eq(properties.id, wishlist.property_id))
    .where(eq(wishlist.user_id, userId));
};
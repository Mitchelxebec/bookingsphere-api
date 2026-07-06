import { ApiError } from "../../shared/utils/ApiError.js";
import * as wishlistRepo from "../repository/wishlistRepository.js";
import { db } from "../../../infrastructure/db/connection.js";
import { properties } from "../../../infrastructure/db/schema/properties.js";
import { and, eq, isNull } from "drizzle-orm";

export const addToWishlistService = async (
  userId: string,
  propertyId: string,
) => {
  // Confirm the property exists and is approved before wishlisting
  const [property] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.approvalStatus, "APPROVED"),
        isNull(properties.deleted_at),
      ),
    )
    .limit(1);

  if (!property) {
    throw new ApiError(404, "Property not found.");
  }

  return await wishlistRepo.addToWishlist(userId, propertyId);
};

export const removeFromWishlistService = async (
  userId: string,
  propertyId: string,
) => {
  const removed = await wishlistRepo.removeFromWishlist(userId, propertyId);

  // If nothing was removed the item wasn't in the wishlist — silently succeed
  return removed ?? { user_id: userId, property_id: propertyId };
};

export const getMyWishlistService = async (userId: string) => {
  return await wishlistRepo.getMyWishlist(userId);
};
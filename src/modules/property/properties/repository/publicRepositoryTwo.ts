import { and, avg, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { getCache, setCache } from "../../../../infrastructure/cache/redis.js";
import { properties } from "../../../../infrastructure/db/schema/properties.js";
import { users } from "../../../../infrastructure/db/schema/users.js";
import { roomTypes } from "../../../../infrastructure/db/schema/room_types.js";
import { discounts } from "../../../../infrastructure/db/schema/discount.js";
import { amenities } from "../../../../infrastructure/db/schema/amenities.js";
import { propertiesToAmenities } from "../../../../infrastructure/db/schema/propertiesToAmenities.js";
import { reviews } from "../../../../infrastructure/db/schema/reviews.js";
import { calculateActivePrice } from "../../../shared/utils/priceCalculator.js";
import { getRatingLabel } from "../../../shared/utils/ratingLabel.js";

const PROPERTY_TTL = 60 * 15; // 15 minutes

type PropertyDetail = {
  id: string;
  name: string;
  propertyType: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
  location: string;
  city: string;
  country: string;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  host: {
    id: string;
    name: string;
    avatar: string | null;
    proprietorStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  };
  roomTypes: {
    id: string;
    name: string;
    capacity: number;
    description: string | null;
    basePrice: string;
    activePrice: number;
  }[];
  amenities: string[];
  reviews: {
    averageRating: number | null;
    ratingLabel: string;
    latest: {
      id: string;
      rating: number;
      comment: string;
      createdAt: Date;
      reviewer: { name: string; avatar: string | null };
    }[];
  };
};

export const findOnePublic = async (
  propertyId: string,
): Promise<PropertyDetail | null> => {
  const cacheKey = `property:${propertyId}`;

  // 1. Check Redis first
  const cached = await getCache<PropertyDetail>(cacheKey);
  if (cached) return cached;

  // 2. Cache miss — run all queries in parallel
  const [propertyRows, roomTypeRows, amenityRows, reviewRows, avgRatingRows] =
    await Promise.all([
      // Query 1: property + host info
      db
        .select({
          id: properties.id,
          name: properties.name,
          propertyType: properties.property_type,
          location: properties.location,
          city: properties.city,
          country: properties.country,
          imageUrl: properties.imageUrl,
          description: properties.description,
          createdAt: properties.createdAt,
          hostId: users.id,
          hostName: users.name,
          hostAvatar: users.avatar_url,
          hostProprietorStatus: users.proprietorStatus,
        })
        .from(properties)
        .innerJoin(users, eq(users.id, properties.ownerId))
        .where(
          and(
            eq(properties.id, propertyId),
            eq(properties.approvalStatus, "APPROVED"),
            isNull(properties.deleted_at),
          ),
        )
        .limit(1),

      // Query 2: room types + discount info (leftJoin since discount is optional)
      db
        .select({
          id: roomTypes.id,
          name: roomTypes.name,
          basePrice: roomTypes.basePrice,
          capacity: roomTypes.capacity,
          description: roomTypes.description,
          discountType: discounts.type,
          discountValue: discounts.value,
          discountStartDate: discounts.startDate,
          discountEndDate: discounts.endDate,
        })
        .from(roomTypes)
        .leftJoin(discounts, eq(discounts.id, roomTypes.discount_id))
        .where(eq(roomTypes.property_id, propertyId)),

      // Query 3: amenities
      db
        .select({ name: amenities.name })
        .from(amenities)
        .innerJoin(
          propertiesToAmenities,
          eq(propertiesToAmenities.amenities_id, amenities.id),
        )
        .where(eq(propertiesToAmenities.property_id, propertyId)),

      // Query 4: latest 5 reviews (no aggregate here)
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          reviewerName: users.name,
          reviewerAvatar: users.avatar_url,
        })
        .from(reviews)
        .innerJoin(users, eq(users.id, reviews.userId))
        .where(eq(reviews.propertyId, propertyId))
        .orderBy(desc(reviews.createdAt))
        .limit(5),

      // Query 5: average rating only
      db
        .select({ averageRating: avg(reviews.rating) })
        .from(reviews)
        .where(eq(reviews.propertyId, propertyId)),
    ]);

  if (propertyRows.length === 0) return null;

  const property = propertyRows[0]!;

  const avgRating = avgRatingRows[0]?.averageRating
    ? parseFloat(avgRatingRows[0].averageRating)
    : null;

  const payload: PropertyDetail = {
    id: property.id,
    name: property.name,
    propertyType: property.propertyType,
    location: property.location,
    city: property.city,
    country: property.country,
    imageUrl: property.imageUrl,
    description: property.description,
    createdAt: property.createdAt,
    host: {
      id: property.hostId,
      name: property.hostName,
      avatar: property.hostAvatar,
      proprietorStatus: property.hostProprietorStatus,
    },
    roomTypes: roomTypeRows.map((rt) => {
      const discount = rt.discountType
        ? {
            type: rt.discountType,
            value: rt.discountValue!,
            startDate: rt.discountStartDate!,
            endDate: rt.discountEndDate!,
          }
        : null;

      return {
        id: rt.id,
        name: rt.name,
        capacity: rt.capacity,
        description: rt.description,
        basePrice: rt.basePrice,
        activePrice: calculateActivePrice({ basePrice: rt.basePrice, discount }),
      };
    }),
    amenities: amenityRows.map((a) => a.name),
    reviews: {
      averageRating: avgRating,
      ratingLabel: getRatingLabel(avgRating ?? 0),
      latest: reviewRows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: {
          name: r.reviewerName,
          avatar: r.reviewerAvatar,
        },
      })),
    },
  };

  // 3. Store in Redis before returning
  await setCache(cacheKey, payload, PROPERTY_TTL);

  return payload;
};
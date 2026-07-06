import {
  and,
  eq,
  exists,
  gte,
  ilike,
  isNull,
  lte,
  not,
  inArray,
  sql,
} from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { getCache, setCache } from "../../../../infrastructure/cache/redis.js";
import { properties } from "../../../../infrastructure/db/schema/properties.js";
import { roomTypes } from "../../../../infrastructure/db/schema/room_types.js";
import { rooms } from "../../../../infrastructure/db/schema/rooms.js";
import { reservations } from "../../../../infrastructure/db/schema/reservation.js";
import { propertiesToAmenities } from "../../../../infrastructure/db/schema/propertiesToAmenities.js";
import { amenities } from "../../../../infrastructure/db/schema/amenities.js";

export interface SearchFilters {
  // 1. Geography (Matches properties.city & properties.country)
  city?: string;
  country?: string;

  // 2. Temporal Availability (Crucial for filtering out booked rooms)
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD

  // 3. Financial Bounds (Matches room_types.basePrice)
  minPrice?: number;
  maxPrice?: number;

  // 4. Capacity Constraints (Matches room_types.capacity)
  guestsCount?: number;

  // 5. Taxonomy & Features
  propertyType?: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE"; // Matches your propertyTypeEnum
  amenities?: string[]; // Array of amenity names, e.g., ["WIFI", "POOL"]

  // 6. Pagination & Database Optimization
  limit: number;
  offset: number;
}

type PropertyListItem = {
  id: string;
  name: string;
  propertyType: "HOTEL" | "APARTMENT" | "VILLA" | "GUESTHOUSE";
  location: string;
  city: string;
  country: string;
  imageUrl: string | null;
  description: string | null;
};

export const findManyPublic = async (filters: SearchFilters) => {
  const cacheKey = `properties:list:${JSON.stringify(filters)}`;

  const cached = await getCache<PropertyListItem[]>(cacheKey);
  if (cached) return cached;

  const conditions = [
    eq(properties.approvalStatus, "APPROVED"),
    isNull(properties.deleted_at),
  ];

  if (filters.city) {
    conditions.push(ilike(properties.city, `%${filters.city}%`));
  }

  if (filters.country) {
    conditions.push(ilike(properties.country, `%${filters.country}%`));
  }

  if (filters.propertyType) {
    conditions.push(eq(properties.property_type, filters.propertyType));
  }

  // PRICE AND ROOM CAPACITY FILTER
  if (filters.minPrice !== undefined) {
    conditions.push(
      exists(
        db
          .select({ id: roomTypes.id })
          .from(roomTypes)
          .where(
            and(
              eq(roomTypes.property_id, properties.id),
              gte(roomTypes.basePrice, String(filters.minPrice)),
            ),
          ),
      ),
    );
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(
      exists(
        db
          .select({ id: roomTypes.id })
          .from(roomTypes)
          .where(
            and(
              eq(roomTypes.property_id, properties.id),
              lte(roomTypes.basePrice, String(filters.maxPrice)),
            ),
          ),
      ),
    );
  }

  if (filters.guestsCount !== undefined) {
    conditions.push(
      exists(
        db
          .select({ id: roomTypes.id })
          .from(roomTypes)
          .where(
            and(
              eq(roomTypes.property_id, properties.id),
              gte(roomTypes.capacity, filters.guestsCount),
            ),
          ),
      ),
    );
  }

  // AVAILABILITY FILTER
  if (filters.checkIn && filters.checkOut) {
    conditions.push(
      exists(
        db
          .select({ id: roomTypes.id })
          .from(roomTypes)
          .innerJoin(rooms, eq(rooms.roomTypeId, roomTypes.id))
          .where(
            and(
              eq(roomTypes.property_id, properties.id),
              not(
                exists(
                  db
                    .select({ id: reservations.id })
                    .from(reservations)
                    .where(
                      and(
                        eq(reservations.roomId, rooms.id),
                        lte(reservations.checkIn, filters.checkOut!),
                        gte(reservations.checkOut, filters.checkIn!),
                      ),
                    ),
                ),
              ),
            ),
          ),
      ),
    );
  }

  // AMENITIES FILTER
  if (filters.amenities && filters.amenities.length > 0) {
    conditions.push(
      exists(
        db
          .select({ id: propertiesToAmenities.property_id })
          .from(propertiesToAmenities)
          .innerJoin(
            amenities,
            eq(amenities.id, propertiesToAmenities.amenities_id),
          )
          .where(
            and(
              eq(propertiesToAmenities.property_id, properties.id),
              inArray(amenities.name, filters.amenities),
            ),
          )
          .groupBy(propertiesToAmenities.property_id)
          .having(
            sql`count(distinct ${amenities.name}) = ${filters.amenities.length}`,
          ),
      ),
    );
  }

  const results = await db
    .selectDistinct({
      id: properties.id,
      name: properties.name,
      propertyType: properties.property_type,
      location: properties.location,
      city: properties.city,
      country: properties.country,
      imageUrl: properties.imageUrl,
      description: properties.description,
    })
    .from(properties)
    .where(and(...conditions))
    .limit(filters.limit)
    .offset(filters.offset);

    await setCache(cacheKey, results, 60 * 5);
    return results
};

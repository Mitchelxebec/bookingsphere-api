import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties.js";
import { amenities } from "./amenities.js";

export const propertiesToAmenities = pgTable(
  "properties_to_amenities",
  {
    property_id: uuid("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),
    amenities_id: uuid("amenities_id")
      .references(() => amenities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.property_id, table.amenities_id] })],
);

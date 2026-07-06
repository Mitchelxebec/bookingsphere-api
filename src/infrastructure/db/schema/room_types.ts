import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { properties } from "./properties.js";
import { discounts } from "./discount.js";

export const roomTypes = pgTable(
  "room_types",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    property_id: uuid("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),
    discount_id: uuid("discount_id").references(() => discounts.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    capacity: integer("capacity").notNull(),
    description: text("description"),
    is_deleted: boolean("is_deleted").default(false).notNull(),
    deleted_at: timestamp("deleted_at"),
  },
  (table) => ({
    searchIdx: index("idx_room_type_search").on(table.capacity),
  }),
);

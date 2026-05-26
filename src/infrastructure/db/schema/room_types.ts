import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { properties } from "./properties.js";

export const roomTypes = pgTable("room_types", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  property_id: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  capacity: integer("capacity").notNull(),
  description: text("description"),
});

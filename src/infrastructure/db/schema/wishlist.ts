import { pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { properties } from "./properties.js";

export const wishlist = pgTable("wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  property_id: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }).notNull(),
});

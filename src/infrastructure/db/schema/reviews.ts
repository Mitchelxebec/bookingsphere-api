import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties.js";
import { users } from "./users.js";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

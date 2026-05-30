import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const propertyTypeEnum = pgEnum("property_type", [
  "HOTEL",
  "APARTMENT",
  "VILLA",
  "GUESTHOUSE",
]);

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  property_type: propertyTypeEnum("property_type").notNull(),
  location: varchar("location", { length: 255 }).notNull(), //Street address
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

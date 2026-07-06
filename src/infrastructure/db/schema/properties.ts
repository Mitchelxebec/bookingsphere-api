import {
  boolean,
  index,
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

export const approvalStatusEnum = pgEnum("approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const properties = pgTable(
  "properties",
  {
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
    approvalStatus: approvalStatusEnum("approval_status").default("PENDING").notNull(),
    rejection_reason: text("rejection_reason"),
    is_deleted: boolean("is_deleted").default(false),
    deleted_at: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    searchIdx: index("idx_properties_search").on(
      table.city,
      table.country,
      table.approvalStatus,
      table.property_type,
    ),
  }),
);

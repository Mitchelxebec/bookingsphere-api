import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { properties } from "./properties.js";
import { users } from "./users.js";
import { reservations } from "./reservation.js";

export const reviewStatusEnum = pgEnum("review_status", [
  "ACTIVE",
  "FLAGGED",
  "REMOVED",
]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  reservationId: uuid("reservation_id")
    .references(() => reservations.id, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  response: text("response"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  reviewStatus: reviewStatusEnum("review_status").default("ACTIVE").notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  flagReason: text("flag_reason"),
  reportedBy: uuid("reported_by").references(() => users.id, {
    onDelete: "set null",
  }),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

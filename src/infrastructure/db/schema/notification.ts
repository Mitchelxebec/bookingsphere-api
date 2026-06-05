import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const notificationEnum = pgEnum("notificationType", [
  "RESERVATION_APPROVED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "REVIEW_INVITATION",
  "PROPERTY_APPROVED",
  "PROPERTY_REJECTED",
  "NEW_MESSAGE",
]);

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  type: notificationEnum("type").notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").default(false),
  resource_id: uuid("resource_id"),
  created_at: timestamp().defaultNow().notNull(),
});

import {
  date,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { rooms } from "./rooms.js";

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDING",
  "PAID",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "EXPIRED",
]);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "restrict" })
    .notNull(),
  status: reservationStatusEnum("status").default("PENDING").notNull(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  totalPrice: integer("total_price").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { reservations } from "./reservation.js";
import { users } from "./users.js";

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "REFUNDED",
  "FAILED",
  "CHARGEBACK",
]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  reservationId: uuid("reservation_id")
    .references(() => reservations.id, { onDelete: "restrict" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

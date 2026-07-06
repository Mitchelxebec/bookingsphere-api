import {
  numeric,
  pgEnum,
  pgTable,
  text,
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

export const refundStatusEnum = pgEnum("refund_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  ]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  reservationId: uuid("reservation_id")
    .references(() => reservations.id, { onDelete: "restrict" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paystackReference: varchar("paystack_reference", {length: 100}).unique().notNull(),
  paystackAccessCode: varchar("paystack_access_code", {length: 100}),
  status: paymentStatusEnum("status").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  failureReason: text("failure_reason"),
  refundedAt: timestamp("refunded_at"),
  refundedStatus: refundStatusEnum("refunded_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

type PaymentInsert = typeof payments.$inferInsert

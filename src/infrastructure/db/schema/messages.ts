import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { reservations } from "./reservation.js";
import { users } from "./users.js";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  reservationId: uuid("reservation_id")
    .references(() => reservations.id, { onDelete: "restrict" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

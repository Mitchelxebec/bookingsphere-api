import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { roomTypes } from "./room_types.js";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  roomTypeId: uuid("room_type_id")
    .references(() => roomTypes.id, { onDelete: "restrict" })
    .notNull(),
  roomNumber: varchar("room_number", { length: 50 }).notNull(),
});

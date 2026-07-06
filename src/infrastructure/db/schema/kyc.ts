import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const kycStatusEnum = pgEnum("kyc_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const kycApplications = pgTable("kyc_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: kycStatusEnum("status").default("PENDING").notNull(),
  documentUrl: text("document_url").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

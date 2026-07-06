import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const proprietorStatusEnum = pgEnum("proprietor_status", [
  "NONE", // Standard guest, never applied
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED", // Banned or paused by an administrator
]);

export const usersEnumRoles = pgEnum("users_role", [
  "GUEST",
  "PROPRIETOR",
  "ADMIN",
  "SUPERADMIN",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password_hash: text("password_hash").notNull(),
  roles: usersEnumRoles("roles").array().default(["GUEST"]).notNull(),
  avatar_url: text("avatar_url"),
  phone: varchar("phone", { length: 20 }),

  // --- Banning & Audit Columns ---
  is_banned: boolean("is_banned").default(false).notNull(),
  ban_reason: text("ban_reason"),
  banned_at: timestamp("banned_at"),
  banned_by: uuid("banned_by").references((): AnyPgColumn => users.id, {
    onDelete: "set null",
  }),
  unbanned_at: timestamp("unbanned_at"),
  unbanned_by: uuid("unbanned_by").references((): AnyPgColumn => users.id, {
    onDelete: "set null",
  }),

  // --- Role Management & Audit Columns ---
  role_updated_at: timestamp("role_updated_at"),
  role_updated_by: uuid("role_updated_by").references(
    (): AnyPgColumn => users.id,
    {
      onDelete: "set null",
    },
  ),

  // New KYC Tracking Fields
  proprietorStatus: proprietorStatusEnum("proprietor_status")
    .default("NONE")
    .notNull(),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),

  created_at: timestamp("created_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
});

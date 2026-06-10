CREATE TYPE "public"."users_role" AS ENUM('GUEST', 'PROPRIETOR', 'ADMIN', 'SUPERADMIN');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT 'GUEST'::"public"."users_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roles" SET DATA TYPE "public"."users_role" USING "roles"::"public"."users_role";
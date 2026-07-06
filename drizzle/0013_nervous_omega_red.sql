ALTER TABLE "users" ALTER COLUMN "proprietor_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "proprietor_status" SET DEFAULT 'NONE'::text;--> statement-breakpoint
DROP TYPE "public"."proprietor_status";--> statement-breakpoint
CREATE TYPE "public"."proprietor_status" AS ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "proprietor_status" SET DEFAULT 'NONE'::"public"."proprietor_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "proprietor_status" SET DATA TYPE "public"."proprietor_status" USING UPPER("proprietor_status")::"public"."proprietor_status";

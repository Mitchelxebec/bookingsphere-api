CREATE TYPE "public"."approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "properties" RENAME COLUMN "is_approved" TO "approval_status";--> statement-breakpoint
DROP INDEX "idx_properties_search";--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "idx_properties_search" ON "properties" USING btree ("city","country","approval_status","property_type");
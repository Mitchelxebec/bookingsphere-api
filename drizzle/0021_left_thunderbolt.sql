CREATE TYPE "public"."review_status" AS ENUM('APPROVED', 'FLAGGED', 'REMOVED');--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "review_status" "review_status" DEFAULT 'APPROVED';
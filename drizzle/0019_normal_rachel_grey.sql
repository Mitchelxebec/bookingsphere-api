CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_status" "refund_status";
CREATE TYPE "public"."kyc_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."proprietor_status" AS ENUM('none', 'pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TABLE "kyc_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "kyc_status" DEFAULT 'PENDING' NOT NULL,
	"document_url" text NOT NULL,
	"rejection_reason" text,
	"reviewed_by" uuid,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "response" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "proprietor_status" "proprietor_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kyc_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kyc_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "kyc_applications" ADD CONSTRAINT "kyc_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_applications" ADD CONSTRAINT "kyc_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
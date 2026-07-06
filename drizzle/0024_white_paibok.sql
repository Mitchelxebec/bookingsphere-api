ALTER TABLE "reviews" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "deleted_at" timestamp;
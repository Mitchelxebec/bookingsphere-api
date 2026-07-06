ALTER TABLE "reviews" ALTER COLUMN "review_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "review_status" SET DEFAULT 'ACTIVE'::text;--> statement-breakpoint
DROP TYPE "public"."review_status";--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('ACTIVE', 'FLAGGED', 'REMOVED');--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "review_status" SET DEFAULT 'ACTIVE'::"public"."review_status";--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "review_status" SET DATA TYPE "public"."review_status" USING "review_status"::"public"."review_status";--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "review_status" SET NOT NULL;
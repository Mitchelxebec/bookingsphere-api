CREATE TYPE "public"."property_type" AS ENUM('HOTEL', 'APARTMENT', 'VILLA', 'GUESTHOUSE');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "property_type" "property_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "city" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "country" varchar(100) NOT NULL;
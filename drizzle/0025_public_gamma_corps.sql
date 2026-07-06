ALTER TABLE "reviews" ADD COLUMN "flag_reason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "reported_by" uuid;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
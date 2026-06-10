ALTER TABLE "users" ADD COLUMN "unbanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unbanned_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unbanned_by_users_id_fk" FOREIGN KEY ("unbanned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
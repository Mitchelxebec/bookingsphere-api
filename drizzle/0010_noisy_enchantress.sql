ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_banned_by_users_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_updated_by_users_id_fk" FOREIGN KEY ("role_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
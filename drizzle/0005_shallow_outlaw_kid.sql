ALTER TABLE "properties" ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
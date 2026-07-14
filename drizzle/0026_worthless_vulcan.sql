ALTER TABLE "messages" ADD COLUMN "receiver_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
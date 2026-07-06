ALTER TABLE "room_types" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "deleted_at" timestamp;
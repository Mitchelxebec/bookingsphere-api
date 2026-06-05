CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."notificationType" AS ENUM('RESERVATION_APPROVED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'REVIEW_INVITATION', 'PROPERTY_APPROVED', 'PROPERTY_REJECTED', 'NEW_MESSAGE');--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "amenities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notificationType" NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"resource_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties_to_amenities" (
	"property_id" uuid NOT NULL,
	"amenities_id" uuid NOT NULL,
	CONSTRAINT "properties_to_amenities_property_id_amenities_id_pk" PRIMARY KEY("property_id","amenities_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "discount_id" uuid;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "base_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties_to_amenities" ADD CONSTRAINT "properties_to_amenities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties_to_amenities" ADD CONSTRAINT "properties_to_amenities_amenities_id_amenities_id_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_property_amenities" ON "amenities" USING btree ("name");--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_properties_search" ON "properties" USING btree ("city","country","is_approved","property_type");--> statement-breakpoint
CREATE INDEX "idx_room_type_search" ON "room_types" USING btree ("capacity");--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN "price";
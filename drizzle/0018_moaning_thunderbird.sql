ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paystack_reference" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paystack_access_code" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_paystack_reference_unique" UNIQUE("paystack_reference");
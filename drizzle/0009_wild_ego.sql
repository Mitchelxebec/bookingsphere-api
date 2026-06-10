ALTER TABLE "users" ALTER COLUMN "roles" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roles" SET DATA TYPE "public"."users_role"[] USING "roles"::text::"public"."users_role"[];--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT '{"GUEST"}';
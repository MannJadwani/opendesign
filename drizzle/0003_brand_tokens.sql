ALTER TABLE "project" ADD COLUMN "brand_tokens" jsonb;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "brand_apply" boolean DEFAULT false NOT NULL;
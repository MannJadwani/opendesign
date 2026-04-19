ALTER TABLE "comment" ALTER COLUMN "anchor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "leaf_id" text;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "x_pct" double precision;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "y_pct" double precision;
ALTER TABLE "products" ADD COLUMN "verification_status" text DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "last_reviewed_at" timestamp;
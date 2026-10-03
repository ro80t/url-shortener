ALTER TABLE "link" DROP CONSTRAINT "link_url_unique";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "link_url_hash_idx" ON "link" USING hash ("url");
CREATE TYPE "public"."domain" AS ENUM('jli.li');--> statement-breakpoint
ALTER TABLE "sites" RENAME TO "link";--> statement-breakpoint
ALTER TABLE "link" RENAME COLUMN "link" TO "url";--> statement-breakpoint
ALTER TABLE "link" DROP CONSTRAINT "sites_link_unique";--> statement-breakpoint
ALTER TABLE "link" ADD COLUMN "domain" "domain";--> statement-breakpoint
ALTER TABLE "link" ADD CONSTRAINT "link_url_unique" UNIQUE("url");
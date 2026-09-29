CREATE TABLE IF NOT EXISTS "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"link" text NOT NULL,
	CONSTRAINT "sites_link_unique" UNIQUE("link")
);

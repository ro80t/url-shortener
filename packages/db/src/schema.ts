import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { JLI_DOMAIN } from "consts";

// short-link.ro80t.com only issues links, it never redirects — so it's not a valid `domain` value.
export const domainEnum = pgEnum("domain", [JLI_DOMAIN]);

export const link = pgTable("link", {
  id: text("id").primaryKey(),
  url: text("url").notNull().unique(),
  domain: domainEnum("domain"),
});

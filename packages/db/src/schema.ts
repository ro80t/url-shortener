import { index, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { SHORT_LINK_DOMAINS } from "consts";

// short-link.ro80t.com only issues links, it never redirects — so it's not a valid `domain` value.
export const domainEnum = pgEnum("domain", SHORT_LINK_DOMAINS);

export const link = pgTable(
  "link",
  {
    id: text("id").primaryKey(),
    url: text("url").notNull(),
    domain: domainEnum("domain"),
  },
  (table) => [
    // No btree index on `url` — btree rejects entries over ~2704 bytes and the legacy jli data
    // holds URLs several times that. A hash index has no such limit and serves the equality
    // lookups (`where url = ...`) that are the only ones made on this column. It can't be UNIQUE,
    // so one URL may end up with more than one id; `link2id` still reuses an existing row.
    index("link_url_hash_idx").using("hash", table.url),
  ],
);

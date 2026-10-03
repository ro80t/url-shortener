import { Hono } from "hono";
import {
  DEFAULT_SHORT_LINK_DOMAIN,
  SHORT_LINK_URL,
  toShortLinkDomain,
  type ShortLinkDomain,
} from "consts";
import { createDb, link as linkTable } from "db";
import { and, eq, isNull, or } from "drizzle-orm";

interface Bindings {
  HYPERDRIVE: { connectionString: string };
}

const NO_CACHE = "no-cache, no-store, must-revalidate";

async function lookup(env: Bindings, domain: ShortLinkDomain, id: string): Promise<string | null> {
  const { db, close } = createDb(env.HYPERDRIVE.connectionString);
  try {
    const rows = await db
      .select({ url: linkTable.url })
      .from(linkTable)
      .where(
        and(
          eq(linkTable.id, id),
          // An id only resolves on the domain it was issued for, so two domains can hand out the
          // same id. Links issued before links carried a domain have it NULL and belong to the
          // default domain; once `UPDATE link SET domain = 'jli.li' WHERE domain IS NULL` has run
          // against the database, this branch can go.
          domain === DEFAULT_SHORT_LINK_DOMAIN
            ? or(eq(linkTable.domain, domain), isNull(linkTable.domain))
            : eq(linkTable.domain, domain),
        ),
      )
      .limit(1);
    return rows[0]?.url ?? null;
  } finally {
    await close();
  }
}

function toShortLinkUrl(requestUrl: string): string {
  const target = new URL(SHORT_LINK_URL);
  const requested = new URL(requestUrl);
  target.pathname = requested.pathname;
  target.search = requested.search;
  return target.toString();
}

const app = new Hono<{ Bindings: Bindings }>();

const routes = app
  .get("/:id", async (c) => {
    // This Worker's code is the same for every short-link domain; the host the request came in on
    // is what decides whose links it resolves. A host that isn't one of ours (a workers.dev
    // preview, `wrangler dev` on localhost) resolves nothing and falls through to the site.
    const domain = toShortLinkDomain(new URL(c.req.url).hostname);
    const link = domain && (await lookup(c.env, domain, c.req.param("id")));
    if (!link) return c.redirect(toShortLinkUrl(c.req.url), 302);
    return new Response(null, {
      status: 301,
      headers: { location: link, "cache-control": NO_CACHE },
    });
  })
  .all("*", (c) => c.redirect(toShortLinkUrl(c.req.url), 302));

export default routes;

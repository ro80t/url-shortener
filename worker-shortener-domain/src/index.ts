import { Hono } from "hono";
import { createDb, sites } from "db";
import { eq } from "drizzle-orm";

interface Bindings {
  HYPERDRIVE: { connectionString: string };
}

const SHORT_LINK_HOST = "https://short-link.ro80t.com";
const NO_CACHE = "no-cache, no-store, must-revalidate";

async function lookup(env: Bindings, id: string): Promise<string | null> {
  const { db, close } = createDb(env.HYPERDRIVE.connectionString);
  try {
    const rows = await db.select({ link: sites.link }).from(sites).where(eq(sites.id, id)).limit(1);
    return rows[0]?.link ?? null;
  } finally {
    await close();
  }
}

function toShortLinkUrl(requestUrl: string): string {
  const target = new URL(SHORT_LINK_HOST);
  const requested = new URL(requestUrl);
  target.pathname = requested.pathname;
  target.search = requested.search;
  return target.toString();
}

const app = new Hono<{ Bindings: Bindings }>();

const routes = app
  .get("/:id", async (c) => {
    const link = await lookup(c.env, c.req.param("id"));
    if (!link) return c.redirect(toShortLinkUrl(c.req.url), 302);
    return new Response(null, {
      status: 301,
      headers: { location: link, "cache-control": NO_CACHE },
    });
  })
  .all("*", (c) => c.redirect(toShortLinkUrl(c.req.url), 302));

export default routes;

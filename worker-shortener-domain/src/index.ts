import { Hono } from "hono";
import { SHORT_LINK_URL } from "consts";
import { createDb, link as linkTable } from "db";
import { eq } from "drizzle-orm";

interface Bindings {
  HYPERDRIVE: { connectionString: string };
}

const NO_CACHE = "no-cache, no-store, must-revalidate";

async function lookup(env: Bindings, id: string): Promise<string | null> {
  const { db, close } = createDb(env.HYPERDRIVE.connectionString);
  try {
    const rows = await db
      .select({ url: linkTable.url })
      .from(linkTable)
      .where(eq(linkTable.id, id))
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
    const link = await lookup(c.env, c.req.param("id"));
    if (!link) return c.redirect(toShortLinkUrl(c.req.url), 302);
    return new Response(null, {
      status: 301,
      headers: { location: link, "cache-control": NO_CACHE },
    });
  })
  .all("*", (c) => c.redirect(toShortLinkUrl(c.req.url), 302));

export default routes;

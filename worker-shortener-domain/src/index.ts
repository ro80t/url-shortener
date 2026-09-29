import { createDb, sites } from "db";
import { eq } from "drizzle-orm";

interface Env {
  HYPERDRIVE: { connectionString: string };
}

const SHORT_LINK_HOST = "https://short-link.ro80t.com";

async function lookup(env: Env, id: string): Promise<string | null> {
  const { db, close } = createDb(env.HYPERDRIVE.connectionString);
  try {
    const rows = await db.select({ link: sites.link }).from(sites).where(eq(sites.id, id)).limit(1);
    return rows[0]?.link ?? null;
  } finally {
    await close();
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const id = url.pathname.slice(1);

    if (req.method === "GET" && id && !id.includes("/")) {
      const link = await lookup(env, id);
      if (link) {
        return new Response(null, {
          status: 301,
          headers: { location: link, "cache-control": "no-cache, no-store, must-revalidate" },
        });
      }
    }

    return Response.redirect(`${SHORT_LINK_HOST}${url.pathname}${url.search}`, 302);
  },
};

import { client, id2link, link2id, type Env as DbEnv } from "./db";
import { validateLink } from "./validate";

interface Env extends DbEnv {
  ASSETS: { fetch: typeof fetch };
}

const NO_CACHE = "no-cache, no-store, must-revalidate";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": NO_CACHE },
  });
}

async function handleCompress(req: Request, env: Env): Promise<Response> {
  const { link } = (await req.json()) as { link?: string };
  if (typeof link !== "string") return json({ content: "URL Format Error" }, 400);

  const error = validateLink(link);
  if (error) return json({ content: error }, 400);

  const { db, close } = client(env);
  try {
    const id = await link2id(db, link);
    return json({ link, id }, 200);
  } finally {
    await close();
  }
}

async function handleDecompress(req: Request, env: Env): Promise<Response> {
  const { id } = (await req.json()) as { id?: string };
  if (typeof id !== "string") return json({ content: "ID NOT FOUND" }, 400);

  const { db, close } = client(env);
  try {
    const link = await id2link(db, id);
    if (!link) return json({ content: "ID NOT FOUND" }, 400);
    return json({ id, link }, 200);
  } finally {
    await close();
  }
}

async function handleShortId(id: string, env: Env): Promise<Response> {
  const { db, close } = client(env);
  let link: string | null;
  try {
    link = await id2link(db, id);
  } finally {
    await close();
  }

  if (link) {
    return new Response(null, {
      status: 301,
      headers: { location: link, "cache-control": NO_CACHE },
    });
  }

  const notFound = await env.ASSETS.fetch(new URL("/404/compression.html", "https://assets.local"));
  return new Response(notFound.body, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": NO_CACHE },
  });
}

async function handleNotFound(env: Env): Promise<Response> {
  const notFound = await env.ASSETS.fetch(new URL("/404.html", "https://assets.local"));
  return new Response(notFound.body, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": NO_CACHE },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/compress") return handleCompress(req, env);
    if (req.method === "POST" && url.pathname === "/api/decompress")
      return handleDecompress(req, env);

    if (req.method === "GET") {
      const id = url.pathname.slice(1);
      if (id && !id.includes("/")) return handleShortId(id, env);
    }

    return handleNotFound(env);
  },
};

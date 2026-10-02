import { Hono } from "hono";
import { inertia } from "@hono/inertia";
import { client, id2link, link2id } from "./db";
import { validateLink } from "./validate";
import { rootView } from "./root-view";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(inertia({ rootView }));

const routes = app
  .get("/", (c) => c.render("Home", { url: new URL(c.req.url).toString() }))
  .post("/api/compress", async (c) => {
    const { link } = await c.req.json<{ link?: string }>();
    if (typeof link !== "string") return c.json({ content: "URL Format Error" }, 400);

    const error = validateLink(link);
    if (error) return c.json({ content: error }, 400);

    const { db, close } = client(c.env);
    try {
      const id = await link2id(db, link);
      return c.json({ link, id });
    } finally {
      await close();
    }
  })
  .post("/api/decompress", async (c) => {
    const { id } = await c.req.json<{ id?: string }>();
    if (typeof id !== "string") return c.json({ content: "ID NOT FOUND" }, 400);

    const { db, close } = client(c.env);
    try {
      const link = await id2link(db, id);
      if (!link) return c.json({ content: "ID NOT FOUND" }, 400);
      return c.json({ id, link });
    } finally {
      await close();
    }
  })
  .all("*", (c) => {
    c.status(404);
    return c.render("Error404", { url: new URL(c.req.url).toString() });
  });

export default routes;

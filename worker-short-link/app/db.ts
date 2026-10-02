import { createDb, link as linkTable, type Database } from "db";
import { eq } from "drizzle-orm";

const ID_SIZE = 6;
const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_SIZE));
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
}

export function client(env: CloudflareBindings) {
  return createDb(env.HYPERDRIVE.connectionString);
}

export async function id2link(db: Database, id: string): Promise<string | null> {
  const rows = await db
    .select({ url: linkTable.url })
    .from(linkTable)
    .where(eq(linkTable.id, id))
    .limit(1);
  return rows[0]?.url ?? null;
}

export async function link2id(db: Database, url: string): Promise<string> {
  const existing = await db
    .select({ id: linkTable.id })
    .from(linkTable)
    .where(eq(linkTable.url, url))
    .limit(1);
  if (existing[0]) return existing[0].id;

  for (;;) {
    const id = generateId();
    const inserted = await db
      .insert(linkTable)
      .values({ id, url })
      .onConflictDoNothing()
      .returning({ id: linkTable.id });
    if (inserted[0]) return inserted[0].id;

    // 競合: idの衝突か、同一urlが並行挿入されたか。後者ならそのidを返す。
    const raced = await db
      .select({ id: linkTable.id })
      .from(linkTable)
      .where(eq(linkTable.url, url))
      .limit(1);
    if (raced[0]) return raced[0].id;
  }
}

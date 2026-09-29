import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDb(connectionString: string) {
  const sql = postgres(connectionString, { max: 5 });
  return { db: drizzle(sql, { schema }), close: () => sql.end() };
}

export type Database = ReturnType<typeof createDb>["db"];

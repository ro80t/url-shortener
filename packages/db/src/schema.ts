import { pgTable, text } from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  link: text("link").notNull().unique(),
});

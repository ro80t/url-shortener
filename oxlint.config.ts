import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: ["packages/db/drizzle/**", "worker-short-link/public/**"],
});

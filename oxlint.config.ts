import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "packages/db/drizzle/**",
    "worker-short-link/public/**",
    "worker-short-link/app/pages.gen.ts",
    "worker-short-link/worker-configuration.d.ts",
  ],
});

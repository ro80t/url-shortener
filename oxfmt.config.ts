import { defineConfig } from "oxfmt";

export default defineConfig({
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  ignorePatterns: [
    "packages/db/drizzle/**",
    "worker-short-link/public/**",
    "worker-short-link/app/pages.gen.ts",
    "worker-short-link/worker-configuration.d.ts",
  ],
});

---
name: deploy
description: Deploy the project's Cloudflare Workers (short-link.ro80t.com issuance API/site, plus one redirect Worker per short-link domain such as jli.li) via Turbo/Wrangler. Use when asked to deploy, ship, or push this repo to production.
---

# Deploy

Bun + Turborepo monorepo, two Cloudflare Workers:

- `worker-short-link` → `short-link.ro80t.com` (issuance API + site — Hono + Inertia.js + Vue 3 SSR, built with Vite/`@cloudflare/vite-plugin`, config in `wrangler.jsonc`)
- `worker-shortener-domain` → `jli.li` (redirect only, no assets/build step, config in `wrangler.jsonc`)

Both share `packages/db` (Drizzle schema/client) and the same Hyperdrive-bound Neon Postgres — no HTTP hop between them.

## Steps

1. `bun install`
2. `bun run typecheck` — turbo runs `tsc --noEmit` across `db`, `worker-short-link`, `worker-shortener-domain`. Must pass before deploying.
3. `bun run deploy` — turbo runs `deploy` in each worker (`deploy` depends on `typecheck` and `build` in `turbo.json`). For `worker-short-link` that's `vite build && wrangler deploy`; for `worker-shortener-domain` it's `wrangler deploy` directly (no `build` script, so Turbo just skips that task for it).

A push to `main` runs all of this automatically: the `deploy` job in `.github/workflows/ci.yml`, gated on the `ci` job. Deploy by hand only to ship without going through CI.

## One-time environment setup (not part of a normal deploy)

- Neon Postgres DB created (its schema is applied by the `deploy` job's `bun run db:migrate` step — see the `db-migration` skill).
- One Hyperdrive config in Cloudflare pointing at that Neon connection string.
- Both workers' configs have their `hyperdrive` binding's `id` set to that Hyperdrive's id — it ships as the placeholder `<hyperdrive-id-here>` in `worker-short-link/wrangler.jsonc` and `worker-shortener-domain/wrangler.jsonc`.
- GitHub repository secrets for the `deploy` job: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL` (the Neon connection string the migration step applies to), and `HYPERDRIVE_ID` (the job substitutes it for the `<hyperdrive-id-here>` placeholder before running `bun run deploy`).
- Cloudflare routes assigning `short-link.ro80t.com/*` and `jli.li/*` to their respective workers.
- `worker-short-link` also needs `bunx wrangler types --env-interface CloudflareBindings` re-run (regenerates the checked-in `worker-configuration.d.ts`) whenever `wrangler.jsonc`'s bindings change.

A deploy with the placeholder Hyperdrive id still typechecks and deploys fine — it only fails at runtime on the first DB call. Check both configs before deploying to a real environment.

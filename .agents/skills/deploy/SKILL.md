---
name: deploy
description: Deploy the two jli.li Cloudflare Workers (short-link.ro80t.com issuance API/site, jli.li redirect) via Turbo/Wrangler. Use when asked to deploy, ship, or push this repo to production.
---

# Deploy

Bun + Turborepo monorepo, two Cloudflare Workers:

- `worker-short-link` → `short-link.ro80t.com` (issuance API + site, serves `public/` as Workers Assets)
- `worker-shortener-domain` → `jli.li` (redirect only, no assets)

Both share `packages/db` (Drizzle schema/client) and the same Hyperdrive-bound Neon Postgres — no HTTP hop between them.

## Steps

1. `bun install`
2. `bun run typecheck` — turbo runs `tsc --noEmit` across `db`, `worker-short-link`, `worker-shortener-domain`. Must pass before deploying.
3. `bun run deploy` — turbo runs `wrangler deploy` in each worker (`deploy` depends on `typecheck` in `turbo.json`, so step 2 happens automatically).

## One-time environment setup (not part of a normal deploy)

- Neon Postgres DB created, schema applied from `packages/db/drizzle/*.sql` (see the `db-migration` skill).
- One Hyperdrive config in Cloudflare pointing at that Neon connection string.
- Both workers' `wrangler.toml` have `[[hyperdrive]] id` set to that Hyperdrive's id — it ships as the placeholder `<hyperdrive-id-here>` in this repo.
- Cloudflare routes assigning `short-link.ro80t.com/*` and `jli.li/*` to their respective workers.

A deploy with the placeholder Hyperdrive id still typechecks and deploys fine — it only fails at runtime on the first DB call. Check both `wrangler.toml` files before deploying to a real environment.

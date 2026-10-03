---
name: db-migration
description: Change the shared Postgres (Neon) schema used by every short-link Worker (issuance plus each domain's redirect Worker, e.g. jli.li), via Drizzle. Use when asked to add or change a column, table, or index on the sites DB.
---

# DB schema changes

Schema lives in exactly one place: `packages/db/src/schema.ts` (Drizzle, `link` table — `id text primary key`, `url text not null` indexed by a hash index, `domain` enum). `url` deliberately carries no UNIQUE constraint and no btree index: a btree entry can't exceed ~2704 bytes and the legacy jli data holds URLs several times that, so lookups go through `link_url_hash_idx` (equality only) and a URL may map to more than one id. Both workers import it from the shared `db` workspace package (`db/src/index.ts` re-exports `schema.ts` and `client.ts`) — never redefine or duplicate the table shape inside a worker.

## Steps

1. Edit `packages/db/src/schema.ts`.
2. `cd packages/db && bun run generate` (`drizzle-kit generate`) — writes a new SQL file under `packages/db/drizzle/` and updates the snapshot in `packages/db/drizzle/meta/`.
3. Apply it. A push to `main` runs `bun run db:migrate` (`drizzle-kit migrate`) in the `deploy` job of `.github/workflows/ci.yml` before deploying the Workers, against the DB in the `DATABASE_URL` secret. To apply it yourself — to the dev DB, or to Neon ahead of a deploy — run `DATABASE_URL=... bun run db:migrate`; drizzle-kit tracks what ran in `drizzle.__drizzle_migrations`, so re-running is a no-op.
4. `bun run typecheck` from the repo root to confirm both workers still compile against the new schema (query call sites in `worker-short-link/src/db.ts` / `worker-shortener-domain/src/index.ts` may need updating).
5. Commit the schema change together with the generated migration SQL and the `meta/` snapshot/journal files.

Never hand-write a migration `.sql` file or hand-edit anything under `drizzle/meta/` — always go through `drizzle-kit generate`, or the next `generate` will diff against a stale snapshot and produce a broken migration.

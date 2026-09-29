---
name: db-migration
description: Change the shared Postgres (Neon) schema used by both jli.li Workers, via Drizzle. Use when asked to add or change a column, table, or index on the sites DB.
---

# DB schema changes

Schema lives in exactly one place: `packages/db/src/schema.ts` (Drizzle, `sites` table — `id text primary key`, `link text unique not null`). Both workers import it from the shared `db` workspace package (`db/src/index.ts` re-exports `schema.ts` and `client.ts`) — never redefine or duplicate the table shape inside a worker.

## Steps

1. Edit `packages/db/src/schema.ts`.
2. `cd packages/db && bun run generate` (`drizzle-kit generate`) — writes a new SQL file under `packages/db/drizzle/` and updates the snapshot in `packages/db/drizzle/meta/`.
3. Apply the generated SQL to the Neon database by hand (Neon SQL editor or `psql`) — nothing in this repo runs migrations automatically at deploy time.
4. `bun run typecheck` from the repo root to confirm both workers still compile against the new schema (query call sites in `worker-short-link/src/db.ts` / `worker-shortener-domain/src/index.ts` may need updating).
5. Commit the schema change together with the generated migration SQL and the `meta/` snapshot/journal files.

Never hand-write a migration `.sql` file or hand-edit anything under `drizzle/meta/` — always go through `drizzle-kit generate`, or the next `generate` will diff against a stale snapshot and produce a broken migration.

# URL Shortener

## Architecture

A Bun workspaces + Turborepo monorepo, with Drizzle ORM as the query layer over a single Neon (Postgres) database that every Worker reaches through Hyperdrive:

- `packages/db/`: Drizzle schema and DB client, shared by every Worker below.
- `worker-short-link/`: the one and only issuance backend — link-issuance API and the front-end site, deployed to `short-link.ro80t.com`. This is where new short links are created and looked up, regardless of which domain they'll redirect from.
- `worker-shortener-domain/`: a thin, redirect-only Worker for `jli.li`, the first short-link domain. It resolves `/{id}` directly against the shared database and 301-redirects; every other path 302-redirects to `short-link.ro80t.com`.

Every Worker reads/writes the same `sites` table (`id text primary key`, `link text unique not null`) through the shared Hyperdrive binding — no HTTP hop between them.

### Adding another short-link domain

The redirect side is designed to be duplicated per domain while `worker-short-link` stays the single shared backend:

1. Copy `worker-shortener-domain/` to a new `worker-<name>/` directory (same `src/index.ts` pattern: look up `/{id}` in the shared DB, redirect if found, otherwise 302 to `short-link.ro80t.com`).
2. Point its `wrangler.toml` `routes` at the new domain, and bind the same Hyperdrive config.
3. Add the new package to the root `package.json` `workspaces` array.
4. Add the new domain to `OWN_DOMAINS` in `worker-short-link/src/validate.ts`, so it can't be shortened into a link on itself (the same reason `jli.li` and `short-link.ro80t.com` are already in that set).
5. If the domain should also appear in the front-end's displayed short URL (`worker-short-link/js/script.js` currently hardcodes `jli.li`), that logic will need to become domain-aware — not required if the new domain is redirect-only infrastructure without its own issuance UI.

## Setup

### 1. Create a Neon (Postgres) database and apply the schema

Run `packages/db/drizzle/0000_shocking_fixer.sql` against it (via the Neon SQL editor or `psql`).

If you change the schema later, run `bun run generate` inside `packages/db` to generate a new migration file — see `.agents/skills/db-migration/SKILL.md`.

### 2. Create a Hyperdrive config in the Cloudflare dashboard

Point it at the Neon connection string from step 1.

### 3. Wire up the Hyperdrive id

Set the Hyperdrive id you just created as `[[hyperdrive]] id` in **every** worker's `wrangler.toml` — currently `worker-short-link` and `worker-shortener-domain` (they ship with the placeholder `<hyperdrive-id-here>`); any redirect worker added for a new domain needs the same id.

### 4. Install dependencies

```console
bun install
```

### 5. Deploy

```console
bun run deploy
```

This runs `turbo run deploy`, which typechecks and then `wrangler deploy`s both Workers.

### 6. Assign routes in the Cloudflare dashboard

Point `short-link.ro80t.com/*` at `worker-short-link` and `jli.li/*` at `worker-shortener-domain` (and, for any future domain, its own route at its own redirect worker).

See `.agents/skills/deploy/SKILL.md` for the day-to-day deploy checklist.

## Changelog

### Version 1.0

Released: 2024/10/06

Initial release (originally a Rust/actix-web + SQLite server). Some pages were still unfinished at launch.

### Cloudflare Workers migration

Rewritten as the Bun/Turborepo + Cloudflare Workers + Neon/Drizzle architecture described above, splitting link issuance (`short-link.ro80t.com`) from the `jli.li` redirect.

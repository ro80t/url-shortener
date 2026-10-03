# URL Shortener

## Architecture

A Bun workspaces + Turborepo monorepo, with Drizzle ORM as the query layer over a single Neon (Postgres) database that every Worker reaches through Hyperdrive:

- `packages/constants/`: shared fixed values (the `jli.li` / `short-link.ro80t.com` domains and origins), imported as `consts`.
- `packages/db/`: Drizzle schema and DB client, shared by every Worker below.
- `worker-short-link/`: the one and only issuance backend — link-issuance API and the front-end site, deployed to `short-link.ro80t.com`. This is where new short links are created and looked up, regardless of which domain they'll redirect from. Built with Hono + Inertia.js + Vue 3 (SSR), bundled by Vite (`@cloudflare/vite-plugin`).
- `worker-shortener-domain/`: a thin, redirect-only Worker for `jli.li`, the first short-link domain. It resolves `/{id}` directly against the shared database and 301-redirects; every other path 302-redirects to `short-link.ro80t.com`.

Every Worker reads/writes the same `link` table (`id text primary key`, `url text unique not null`, `domain` enum) through the shared Hyperdrive binding — no HTTP hop between them.

`worker-shortener-domain` is one instance of a repeatable, redirect-only pattern — the architecture is built to let more short-link domains be added the same way later, without touching `worker-short-link`. See `CONTRIBUTING.md` for the steps to add one.

## Setup

### 1. Create a Neon (Postgres) database and apply the schema

Run `packages/db/drizzle/0000_shocking_fixer.sql` against it (via the Neon SQL editor or `psql`).

If you change the schema later, run `bun run generate` inside `packages/db` to generate a new migration file — see `.agents/skills/db-migration/SKILL.md`.

### 2. Create a Hyperdrive config in the Cloudflare dashboard

Point it at the Neon connection string from step 1.

### 3. Wire up the Hyperdrive id

Set the Hyperdrive id you just created as the `hyperdrive` binding's `id` in **every** worker's config — `worker-short-link/wrangler.jsonc` and `worker-shortener-domain/wrangler.jsonc` (they ship with the placeholder `<hyperdrive-id-here>`); any redirect worker added for a new domain needs the same id.

### 4. Install dependencies

```console
bun install
```

### 5. Deploy

```console
bun run deploy
```

This runs `turbo run deploy`, which typechecks, builds (`worker-short-link` runs a Vite build first), and then `wrangler deploy`s both Workers.

### 6. Assign routes in the Cloudflare dashboard

Point `short-link.ro80t.com/*` at `worker-short-link` and `jli.li/*` at `worker-shortener-domain` (and, for any future domain, its own route at its own redirect worker).

See `.agents/skills/deploy/SKILL.md` for the day-to-day deploy checklist.

## Changelog

### Version 1.0

Released: 2024/10/06

Initial release (originally a Rust/actix-web + SQLite server). Some pages were still unfinished at launch.

### Cloudflare Workers migration

Rewritten as the Bun/Turborepo + Cloudflare Workers + Neon/Drizzle architecture described above, splitting link issuance (`short-link.ro80t.com`) from the `jli.li` redirect.

### worker-short-link rewritten in Vue

`worker-short-link`'s front-end and API were rewritten with Hono + Inertia.js + Vue 3 (SSR) + Vite, following the architecture of [ro80t/service-status-page](https://github.com/ro80t/service-status-page). Visual design and copy are unchanged; the plain static-HTML + hand-rolled `fetch` handler were replaced with Vue SFC pages and Hono routes.

### Redesign and rename to "ro80t's short link"

The front-end was redesigned (system font stack, light/dark theme, card layout, copy button, loading states) and rebranded from the JLI-era name — `jli.li` stays as the short-link domain. The 64MB of bundled Japanese TTF webfonts (12MB of which every visitor downloaded) were dropped.

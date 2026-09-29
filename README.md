# JLI Project

Repository for https://jli.li, a URL shortener.

## Why "JLI"?

We liked how short `jli.li` looked as a domain, so we picked it up. No deeper meaning behind the name.

## Why open source?

This project is open source so anyone can send a Pull Request if they spot a mistake in the code.

Team ThunLights is also actively recruiting members. See [here](https://github.com/ThunLights#%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC%E5%8B%9F%E9%9B%86) for details.

## Architecture

A Bun workspaces + Turborepo monorepo, made up of two Cloudflare Workers backed by a single Neon (Postgres) database via Hyperdrive, with Drizzle ORM as the query layer:

- `packages/db/`: Drizzle schema and DB client, shared by both Workers.
- `worker-short-link/`: link-issuance API and the front-end site, deployed to `short-link.ro80t.com`.
- `worker-shortener-domain/`: redirect-only Worker, deployed to `jli.li`. It resolves `/{id}` directly against the same database and 301-redirects; every other path 302-redirects to `short-link.ro80t.com`.

Both Workers read/write the same `sites` table (`id text primary key`, `link text unique not null`) through the shared Hyperdrive binding — no HTTP hop between them.

## Setup

### 1. Create a Neon (Postgres) database and apply the schema

Run `packages/db/drizzle/0000_shocking_fixer.sql` against it (via the Neon SQL editor or `psql`).

If you change the schema later, run `bun run generate` inside `packages/db` to generate a new migration file — see `.agents/skills/db-migration/SKILL.md`.

### 2. Create a Hyperdrive config in the Cloudflare dashboard

Point it at the Neon connection string from step 1.

### 3. Wire up the Hyperdrive id

Set the Hyperdrive id you just created as `[[hyperdrive]] id` in **both** `worker-short-link/wrangler.toml` and `worker-shortener-domain/wrangler.toml` (they ship with the placeholder `<hyperdrive-id-here>`).

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

Point `short-link.ro80t.com/*` at `worker-short-link` and `jli.li/*` at `worker-shortener-domain`.

See `.agents/skills/deploy/SKILL.md` for the day-to-day deploy checklist.

## Changelog

### Version 1.0

Released: 2024/10/06

Initial release (originally a Rust/actix-web + SQLite server). Some pages were still unfinished at launch.

### Cloudflare Workers migration

Rewritten as the Bun/Turborepo + Cloudflare Workers + Neon/Drizzle architecture described above, splitting link issuance (`short-link.ro80t.com`) from the `jli.li` redirect.

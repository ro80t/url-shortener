# Contributing

Thanks for considering a contribution to this URL shortener. This is a small Bun/Turborepo monorepo; the workflow is intentionally lightweight.

## Project layout

See `README.md` for the full architecture. In short: `packages/constants/` (`consts`) holds shared fixed values like the domain names, `packages/db/` holds the schema shared by every Worker, `worker-short-link/` is the single issuance backend, and `worker-shortener-domain/` (plus any future domain worker) is a thin redirect-only Worker.

`.agents/skills/` has step-by-step checklists for recurring tasks (`deploy`, `db-migration`) — read the relevant one before touching deploy config or the DB schema.

## Getting started

Requires [Bun](https://bun.sh).

```console
bun install
```

Each worker can be run locally with:

```console
cd worker-short-link  # or worker-shortener-domain
bun run dev
```

`worker-short-link`'s `dev` runs `vite` (Hono + Inertia + Vue, SSR'd on every request); `worker-shortener-domain`'s runs `wrangler dev` directly. Both connect to Postgres through a Hyperdrive binding, so either needs a real Hyperdrive id in its config (`wrangler.jsonc`), or a `localConnectionString` added under the `hyperdrive` binding pointing at a local/dev Postgres instance for offline development. `docker compose up -d` from the repo root starts exactly that Postgres (port 1234, user/0000/test) and applies `packages/db/drizzle/` on first start.

## Before opening a PR

```console
bun run typecheck
bun run lint
bun run format
```

`typecheck` runs `tsc --noEmit` across every workspace via Turbo. `lint` runs oxlint and `format` runs oxfmt (writes in place) over the TypeScript/JavaScript source. All three must be clean before opening a PR.

If you changed `packages/db/src/schema.ts`, follow `.agents/skills/db-migration/SKILL.md` — generate the migration with `drizzle-kit generate`, don't hand-write SQL under `packages/db/drizzle/`, and commit the generated migration + `meta/` snapshot alongside your schema change.

## Adding a new short-link domain

The redirect side is designed to be duplicated per domain while `worker-short-link` stays the single shared backend:

1. Copy `worker-shortener-domain/` to a new `worker-<name>/` directory (same `src/index.ts` pattern: look up `/{id}` in the shared DB, redirect if found, otherwise 302 to `short-link.ro80t.com`).
2. Point its `wrangler.jsonc` `routes` at the new domain, and bind the same Hyperdrive config.
3. Add the new package to the root `package.json` `workspaces` array.
4. Add the new domain to `OWN_DOMAINS` in `worker-short-link/app/validate.ts`, so it can't be shortened into a link on itself (the same reason `jli.li` and `short-link.ro80t.com` are already in that set).
5. If the domain should also appear in the front-end's displayed short URL (`worker-short-link/app/pages/Home.vue` currently hardcodes `jli.li`), that logic will need to become domain-aware — not required if the new domain is redirect-only infrastructure without its own issuance UI.

## Code style

- TypeScript, `strict` mode — keep it that way, don't add `any` escapes.
- Keep changes minimal and reuse what's already in `packages/db` or the worker you're editing rather than introducing new abstractions or dependencies for something a few lines can do.
- No unrelated refactors in the same PR as a feature/fix — keep diffs scoped to what you're actually changing.

## Opening a PR

- Fork the repo, branch off `main`, and open a PR against `main`.
- Describe _why_ the change is needed, not just what changed.
- Keep PRs focused — one concern per PR is easier to review than several bundled together.

## Questions

If you're unsure whether a change is wanted (a new feature, a behavior change, removing something), open an issue in this repository first.

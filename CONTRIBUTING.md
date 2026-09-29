# Contributing

Thanks for considering a contribution to JLI. This is a small Bun/Turborepo monorepo; the workflow is intentionally lightweight.

## Project layout

See `README.md` for the full architecture. In short: `packages/db/` holds the schema shared by every Worker, `worker-short-link/` is the single issuance backend, and `worker-shortener-domain/` (plus any future domain worker) is a thin redirect-only Worker.

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

Both Workers connect to Postgres through a Hyperdrive binding, so `wrangler dev` needs either a real Hyperdrive id in `wrangler.toml`, or a `localConnectionString` added under `[[hyperdrive]]` pointing at a local/dev Postgres instance for offline development.

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
2. Point its `wrangler.toml` `routes` at the new domain, and bind the same Hyperdrive config.
3. Add the new package to the root `package.json` `workspaces` array.
4. Add the new domain to `OWN_DOMAINS` in `worker-short-link/src/validate.ts`, so it can't be shortened into a link on itself (the same reason `jli.li` and `short-link.ro80t.com` are already in that set).
5. If the domain should also appear in the front-end's displayed short URL (`worker-short-link/js/script.js` currently hardcodes `jli.li`), that logic will need to become domain-aware — not required if the new domain is redirect-only infrastructure without its own issuance UI.

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

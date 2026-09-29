# Contributing

Thanks for considering a contribution to JLI. This is a small Bun/Turborepo monorepo; the workflow is intentionally lightweight.

## Project layout

- `packages/db/` — Drizzle schema and DB client shared by both Workers. Schema changes always start here.
- `worker-short-link/` — link-issuance API + front-end site (`short-link.ro80t.com`).
- `worker-shortener-domain/` — redirect-only Worker (`jli.li`).
- `.agents/skills/` — step-by-step checklists for recurring tasks (`deploy`, `db-migration`); read the relevant one before touching deploy config or the DB schema.

See `README.md` for the full architecture.

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
```

This runs `tsc --noEmit` across every workspace via Turbo and must pass.

If you changed `packages/db/src/schema.ts`, follow `.agents/skills/db-migration/SKILL.md` — generate the migration with `drizzle-kit generate`, don't hand-write SQL under `packages/db/drizzle/`, and commit the generated migration + `meta/` snapshot alongside your schema change.

## Code style

- TypeScript, `strict` mode — keep it that way, don't add `any` escapes.
- Keep changes minimal and reuse what's already in `packages/db` or the worker you're editing rather than introducing new abstractions or dependencies for something a few lines can do.
- No unrelated refactors in the same PR as a feature/fix — keep diffs scoped to what you're actually changing.

## Opening a PR

- Fork the repo, branch off `main`, and open a PR against `main`.
- Describe *why* the change is needed, not just what changed.
- Keep PRs focused — one concern per PR is easier to review than several bundled together.

## Questions

If you're unsure whether a change is wanted (a new feature, a behavior change, removing something), open an issue in this repository first.

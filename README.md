# Scripture Atlas

An atlas of scripture — every person, place, event, genealogy, prophecy, and Hebrew name, mapped and sourced.

A monorepo focused on **accuracy over interpretation** — structured biblical
data (people, places, events, prophecy), genealogies, timelines, and maps.

## Stack

- Turborepo + pnpm workspaces
- TypeScript 6 everywhere
- Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- Prisma 6 + PostgreSQL
- Zustand for client state, shadcn/ui-compatible component foundation
- Reactflow + Dagre for genealogy graphs; Leaflet for biblical geography

## Layout

```
apps/
  web/                     # Next.js App Router frontend
packages/
  bible-data/              # Structured biblical data + types
  config/                  # Shared constants and feature flags
  db/                      # Prisma schema + client singleton
```

## Getting started

```bash
pnpm install
pnpm dev
```

The web app boots on http://localhost:3000.

### Database

Most data-driven pages (people, tribes, places, timeline, map) read from
PostgreSQL. The Prisma client lives in `packages/db`, and the entire dataset
is rebuilt from the TypeScript source-of-truth in `packages/bible-data` by
the seed script — it is idempotent (`upsert` everywhere) and safe to re-run.

```bash
cp packages/db/.env.example packages/db/.env
# edit DATABASE_URL
pnpm --filter @bible-visualizer/db db:generate
pnpm --filter @bible-visualizer/db db:push
pnpm --filter @bible-visualizer/db db:seed
```

The biblical data lives entirely in TypeScript under
`packages/bible-data/src/*.ts` (people, genealogy edges, tribes, places,
events, books, translations). Postgres is a derived index, not the source
of truth — re-running the seed against a fresh database reproduces the full
dataset.

## Scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Run all apps in dev mode                  |
| `pnpm build`     | Build all apps and packages               |
| `pnpm lint`      | Lint all workspaces                       |
| `pnpm typecheck` | Type-check all workspaces                 |
| `pnpm format`    | Prettier-format the repo                  |
| `pnpm --filter @bible-visualizer/db db:seed` | Rebuild DB from `packages/bible-data` |

## Design principles

- **Data-driven UI.** No biblical knowledge encoded in components.
- **Traceability.** Every datum carries `scriptureReferences` and a
  `confidenceLevel` (`explicit | inferred | traditional | debated`).
- **Future-aware models.** Genealogy edges, prophecy fulfillment, and
  geo-coordinates are first-class so we don't have to migrate later.

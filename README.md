# Bible Visualizer

An interactive, accurate, and visual way to understand the Bible.

A monorepo focused on **accuracy over interpretation** — structured biblical
data (people, places, events, prophecy), genealogies, timelines, and maps.

## Stack

- Turborepo + pnpm workspaces
- TypeScript 6 everywhere
- Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- Prisma 7 + PostgreSQL
- Zustand for client state, shadcn/ui-compatible component foundation

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

### Database (optional for the homepage)

The Prisma client lives in `packages/db`. To use it:

```bash
cp packages/db/.env.example packages/db/.env
# edit DATABASE_URL
pnpm --filter @bible-visualizer/db db:generate
pnpm --filter @bible-visualizer/db db:push
```

## Scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Run all apps in dev mode                  |
| `pnpm build`     | Build all apps and packages               |
| `pnpm lint`      | Lint all workspaces                       |
| `pnpm typecheck` | Type-check all workspaces                 |
| `pnpm format`    | Prettier-format the repo                  |

## Design principles

- **Data-driven UI.** No biblical knowledge encoded in components.
- **Traceability.** Every datum carries `scriptureReferences` and a
  `confidenceLevel` (`explicit | inferred | traditional | debated`).
- **Future-aware models.** Genealogy edges, prophecy fulfillment, and
  geo-coordinates are first-class so we don't have to migrate later.

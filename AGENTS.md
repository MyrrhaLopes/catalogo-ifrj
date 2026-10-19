# AGENTS.md

This file gives coding agents project-specific context. Keep it short and update it when workflows change.

## Project Overview

- Primary app or package: `catalogo-ifrj` — Full-stack biological species catalog (React + Vite frontend, Express + Drizzle ORM + PostgreSQL backend).
- Main entry points: `src/frontend/main.tsx` (frontend SPA), `src/backend/server.ts` (backend HTTP server), `src/backend/db/seed.ts` and `src/backend/db/seeds/seed-especies-catalogo-2026-10.ts` (database seeding).
- Important directories:
  - `src/frontend/` — React 19 UI (`features/`, `pages/`, `components/`, `shared/`)
  - `src/backend/http/features/` — Express routes, services, and Zod schemas per domain feature
  - `src/backend/db/` — Drizzle ORM schema (`schema.ts`), connection, and seed scripts

## Architecture Notes

- Module boundaries: Frontend consumes backend Zod schemas/types from `@/backend/http/features/*/*.schema` for API validation, while HTTP calls go through `src/frontend/shared/api/client.ts`.
- Generated or vendored code: `src/frontend/components/ui/` (shadcn/Radix UI primitives), Drizzle migrations.
- Sensitive areas: `src/backend/http/middlewares/` (authentication/session/RBAC), `src/backend/db/schema.ts` (database tables and relations).

## Commands

- Install: `npm install`
- Build: `npm run build` (`tsc -b && vite build`)
- Test: `npm test` (`vitest run`)
- Typecheck or lint: `npx tsc -b --noEmit` / `npm run lint` (`eslint .`)

## Fallow

- Use `fallow audit --format json --quiet` before committing AI-generated changes.
- Use `fallow dead-code --format json --quiet`, `fallow dupes --format json --quiet`, and `fallow health --format json --quiet` for targeted checks.
- Use `fallow list --entry-points --format json --quiet` and `fallow list --boundaries --format json --quiet` to inspect project shape.

<!-- generated:task-matrix:start -->
| When the agent is about to... | Run |
|---|---|
| delete an "unused" export or file | `fallow dead-code --trace <file>:<export>` |
| prove a TypeScript symbol's exact consumers before refactoring | `fallow dead-code --type-aware --symbol-impact <file>:<export-or-class.method>` |
| find how one module reaches another | `fallow trace --path <from> <to>` (Reports `reachable: false` instead of failing when no import path exists; type-only hops are reported, not skipped.) |
| delete an "unused" dependency | `fallow dead-code --trace-dependency <name>` |
| migrate a dependency | `fallow trace --dependency <name> --sites` (Counts each imported name, follows one hop through project wrappers, and counts each use that it cannot resolve.) |
| commit or open a PR | `fallow audit --base <ref>` |
| read a diff before approving it | `fallow review --base <ref> --brief` (orientation, never gates: deterministic and always exit 0, unlike the audit row) |
| prioritize refactoring | `fallow health --hotspots --targets` |
| ask who owns code | `fallow health --ownership` |
| check untested-but-reachable code | `fallow health --coverage-gaps` |
| consolidate duplication | `fallow dupes --trace dup:<fingerprint>` |
| find feature flags | `fallow flags` |
| check which architecture rules apply to a file before changing it | `fallow guard <files>` |
| check import cycles, boundaries and policy rules after changing code | `fallow architecture` |
| surface security candidates | `fallow security` |
| understand a finding | `fallow explain <issue-type>` |
| scope a monorepo | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command) |
<!-- generated:task-matrix:end -->

## Agent Rules

- Do not edit:
- Always ask before:
- Preferred style:

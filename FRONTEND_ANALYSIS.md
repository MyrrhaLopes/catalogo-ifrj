# Frontend Analysis

## API Layer

### 1. No `apiFetch` client wrapper

Every `.api.ts` file manually writes `fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" } })` and its own `if (!res.ok) throw new Error(...)`. That's 10+ files duplicating the same pattern. A thin `apiFetch(path, options)` wrapper centralizes error handling, credentials, and base URL — and makes it trivial to later add things like an auth token header or request ID.

### 2. Auth check duplicated in three places

- `useAuth` hook (used in `CatalogHeader`)
- `AdminPage.tsx:beforeLoad` (raw `fetch` + manual cast)
- Any future protected route would repeat the same `beforeLoad` pattern

Extract `requireAuth()` and `requireAdmin()` as reusable `beforeLoad` helpers and use them in every protected route definition.

### 3. Duplicate `useAdminSpecimen` hook

`src/frontend/features/admin/hooks/useAdminSpecimen.ts` is just a re-export barrel for the real hook at `src/frontend/features/specimens/hooks/useAdminSpecimen.ts`. It's an artifact of a past refactor. Either delete the barrel and update all imports to point to the real file, or keep only the barrel as the public interface and ensure nothing imports the real file directly.

### 4. Two `cn()` implementations

`src/lib/utils.ts` (shadcn-generated, re-exports from the `cn` npm package) and `src/frontend/shared/utils.ts` (hand-written using `clsx` + `tailwind-merge`) both export `cn`. The project should settle on one — the shadcn path at `src/lib/utils.ts` is the standard, so `src/frontend/shared/utils.ts` can be deleted and its imports redirected.

### 5. Hand-rolled toast vs shadcn Sonner

`ToastContext.tsx` is a custom implementation. shadcn ships Sonner integration (`npx shadcn add sonner`) which is already feature-complete, accessible, and animated. Since the project uses shadcn for everything else, this is worth swapping.

### 6. No route-level `pendingComponent` / `errorComponent`

TanStack Router supports declarative loading and error UIs at the route definition level. Right now each page manages its own `isLoading`/`isError` state independently. Centralizing these in the route definitions reduces per-page boilerplate.

---

## React Components

### 7. `SpeciesViewPage.tsx` (509 lines) — too many responsibilities

This file handles: loading/error guard, article view mode, article preview mode, article edit mode, drag-and-drop logic, hero section layout, scientific name derivation, image viewer state, source map computation, and five local helper components.

The most glaring issue: the 3-column article layout is written **three times** — once for view mode, once for edit-preview, once for edit mode — with nearly identical structure:

```tsx
<div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
  <aside className="w-44 shrink-0 ..."><ArticleSectionRenderer sectionKey="left" ... /></aside>
  <article className="flex-1 ..."><ArticleSectionRenderer sectionKey="center" ... /></article>
  <aside className="w-52 shrink-0 ..."><ArticleSectionRenderer sectionKey="right" ... /></aside>
</div>
```

**Suggested split:**
- `SpeciesViewPage.tsx` — route definition + loading/error guard only
- `SpeciesHero.tsx` — hero section with images, name, breadcrumb, specimens strip
- `ArticleLayout.tsx` — the `flex gap-10` 3-column container (accepts children per column)
- `ArticleEditController.tsx` — owns all DnD state, `handleDragOver`, `handleDragEnd`, wraps `DndContext`
- `StarButton`, `Breadcrumb`, `HeroImage`, `ThumbnailImage` — move to appropriate feature folders

### 8. `CatalogHeader.tsx` (309 lines) — three components in one

Three entirely separate concerns live in the same file:
- **Search autocomplete** — debounce state, dropdown, keyboard handling
- **User menu** — dropdown with logout/favorites/edit links
- **Delete account dialog** — its own state machine (`deleteDialogOpen`, `confirmText`, `isDeleting`)

**Suggested split:**
- `CatalogHeader.tsx` — layout shell only, composes the three below
- `HeaderSearch.tsx` — search input + autocomplete dropdown
- `UserMenu.tsx` — the `DropdownMenu` and logout action
- `DeleteAccountDialog.tsx` — the confirmation dialog (controlled by `UserMenu`)

### 9. `ArticleSectionRenderer` / `ArticleBlockRenderer` — 6-prop drill

`sourceMaps`, `inlineSources`, `attributeSources`, `content`, and `species` are passed as explicit props through `ArticleSectionRenderer` → `ArticleBlockRenderer` → individual block components. Any new block that needs `species` has to thread it through every layer.

**Fix:** an `ArticleViewContext` that provides these values. Consumers call `useArticleView()` instead of accepting them as props. This also makes it easy to add new context values (e.g. `isAdmin`, `editMode`) later without changing every component signature.

### 10. No shared `<PageShell>` layout component

Every page repeats:

```tsx
<div className="min-h-screen flex flex-col">
  <CatalogHeader />
  ...
</div>
```

A `PageShell` component wrapping `CatalogHeader` and a `<main>` slot would eliminate this repetition and make adding a site-wide footer trivial.

### 11. `SpeciesTable.tsx` — good instincts, incomplete split

The pattern of extracting cell sub-components (`ThumbnailCell`, `TaxonomyCell`, `SpecimenChip`, etc.) is correct. The remaining issue is that the column definitions and the table rendering component sit in the same 439-line file. The columns array (lines 277–332) is independent of the table and could live in `SpeciesTableColumns.tsx`, keeping the main table file under ~150 lines.

### 12. `CreateSpeciesModal.tsx` — business logic inside a modal

The `topSortDrafts` algorithm and the entire `handleSubmit` multi-step creation flow (create draft nodes in topological order, resolve temp IDs, create species, navigate) are inline in the modal component. This logic is testable and reusable but invisible to tests because it lives inside a React component.

**Fix:** extract as a `useCreateSpeciesWithDraftTaxonomy()` hook in the admin hooks folder. The modal then calls `hook.submit(selectedNode, draftNodes)` and reacts to `hook.isPending` / `hook.error`.

---

## AI-Assisted Development Workflow

### 13. Expand `CLAUDE.md` with conventions

The current `CLAUDE.md` is minimal. A richer file describing the feature folder contract (`feature.route.ts` → `feature.service.ts` → `feature.schema.ts`), component naming conventions, which files are off-limits (auto-generated), and where to place new hooks/api files would make AI-generated code immediately consistent without human correction.

### 14. Add service-layer unit tests

The only tests today are for pure utility functions (`highlight.test.ts`, `unitConversion.test.ts`). Services (`SPECIES_SERVICE`, `USER_SERVICE`, etc.) have none. Service tests are the highest-ROI target for safe AI-assisted refactoring — they catch regressions that TypeScript cannot.

---

## Summary table

| # | File / Area | Problem | Fix |
|---|---|---|---|
| 1 | All `.api.ts` files | Duplicated fetch boilerplate | `apiFetch` wrapper |
| 2 | Protected routes | Auth check in 3 places | `requireAuth` / `requireAdmin` helpers |
| 3 | `useAdminSpecimen` | Duplicate hook file | Delete barrel or consolidate |
| 4 | `cn()` | Two implementations | Keep `src/lib/utils.ts`, delete the other |
| 5 | `ToastContext.tsx` | Hand-rolled toast | Replace with shadcn Sonner |
| 6 | All routes | No route-level loading/error UI | `pendingComponent` / `errorComponent` |
| 7 | `SpeciesViewPage.tsx` | 509 lines, 3× repeated layout | Split into 4–5 focused files |
| 8 | `CatalogHeader.tsx` | 309 lines, 3 concerns | Split into 4 focused files |
| 9 | Article components | 6-prop drill | `ArticleViewContext` |
| 10 | All pages | Repeated `min-h-screen` + header | `PageShell` layout component |
| 11 | `SpeciesTable.tsx` | Column defs + table in same file | `SpeciesTableColumns.tsx` |
| 12 | `CreateSpeciesModal.tsx` | Business logic in a modal | `useCreateSpeciesWithDraftTaxonomy` hook |
| 13 | `CLAUDE.md` | Minimal conventions | Expand with feature folder contract |
| 14 | Tests | No service-layer tests | Add unit tests for services |

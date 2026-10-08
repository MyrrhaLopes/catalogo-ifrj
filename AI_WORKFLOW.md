# AI-Assisted Development Workflow

Suggestions for making this codebase easier to work on with AI coding assistants.

---

## From the general analysis

### 1. Expand `CLAUDE.md` with conventions

The current `CLAUDE.md` is minimal. A richer file describing the feature folder contract (`feature.route.ts` → `feature.service.ts` → `feature.schema.ts`), component naming conventions, which files are off-limits (auto-generated), and where to place new hooks/api files would make AI-generated code immediately consistent without human correction.

### 2. Add service-layer unit tests

The only tests today are for pure utility functions (`highlight.test.ts`, `unitConversion.test.ts`). Services (`SPECIES_SERVICE`, `USER_SERVICE`, etc.) have none. Service tests are the highest-ROI target for safe AI-assisted refactoring — they catch regressions that TypeScript cannot.

---

## Preventing messy React components

The following are rules that, when written into `CLAUDE.md`, stop AI assistants from producing the same kinds of bloat found in `SpeciesViewPage.tsx` and `CatalogHeader.tsx`.

### 4. Define a hard file-size limit for components

Without an explicit rule, AI assistants will keep adding to whatever file is already open rather than creating a new one. A concrete limit creates a forcing function.

**Rule to add to `CLAUDE.md`:**
> A component file must not exceed 150 lines. If adding to a file would push it over, extract the new piece into its own file first.

### 5. Define a component taxonomy and where each type lives

AI tools generate components at the call site by default. Without a taxonomy, everything ends up in the same file or in `/components` regardless of scope.

**Rule to add to `CLAUDE.md`:**

| Type | Rule | Folder |
|---|---|---|
| Page | One per route, only composes features — no local state beyond loading/error guard | `src/frontend/pages/` |
| Feature component | Belongs to one feature domain, may use that feature's hooks | `src/frontend/features/<name>/components/` |
| Layout | Pure structure, no data fetching, no hooks | `src/frontend/components/layout/` |
| UI primitive | Stateless or minimally stateful, no domain knowledge | `src/frontend/components/ui/` |

### 6. Require business logic to live in hooks, not components

AI assistants routinely inline `async function handleSubmit()` with multi-step API calls directly inside components. This makes the logic untestable and invisible.

**Rule to add to `CLAUDE.md`:**
> Any logic that involves more than one API call, a loop over data, or a derived computation must be extracted into a custom hook in the feature's `hooks/` folder before it appears in a component.

The `CreateSpeciesModal.tsx` topological-sort + multi-step creation flow is the current example of what this rule prevents.

### 7. Require one concern per component

The `CatalogHeader.tsx` problem — a search widget, a user menu, and a delete-account dialog all in one file — happens because AI defaults to "add it to the component that already uses it." An explicit co-location rule prevents this.

**Rule to add to `CLAUDE.md`:**
> A component handles one concern. If a component renders a modal, the modal is a separate component file. If a component contains a dropdown and an input with debounce, the input is a separate component.

### 8. Name the prop-drilling threshold

Without a rule, AI tools will pass props down indefinitely because it's locally the simplest option. The `ArticleSectionRenderer` 6-prop drill is the result.

**Rule to add to `CLAUDE.md`:**
> If the same prop is passed through more than two component layers without being used by the intermediate component, introduce a React context instead.

### 9. Require layout not to repeat

The `SpeciesViewPage.tsx` three-times-repeated 3-column layout exists because AI generated each mode (view / preview / edit) independently. A rule about duplication acts as a refactoring signal.

**Rule to add to `CLAUDE.md`:**
> If the same JSX structure appears more than once in a file (or across sibling files), extract it as a named component before proceeding.

### 10. Separate loading/error shells from loaded content

The pattern where a page component renders a loading spinner, an error state, and then the full loaded page as a giant inline function is a recurring source of bloat. TanStack Router makes the alternative explicit.

**Rule to add to `CLAUDE.md`:**
> Page components must not contain inline loading or error states. Use `pendingComponent` and `errorComponent` in the route definition. The page component itself receives data as already-loaded props via a loader, or via a hook whose loading state is handled by the route.

### 11. Define the `PageShell` contract

Without knowing `PageShell` exists, AI will reconstruct `<div className="min-h-screen"><CatalogHeader />` in every new page it generates.

**Rule to add to `CLAUDE.md`:**
> Every page must be wrapped in `<PageShell>`. Never render `<CatalogHeader>` directly inside a page component.

---

## Summary — what to add to `CLAUDE.md`

```
## Component rules

- Max 150 lines per component file. Extract before adding.
- Pages only compose features. No business logic, no inline loading states.
- Business logic (multi-step async, derived data, loops) goes in a hook in the feature's hooks/ folder.
- One concern per component. Modals are separate files. Complex inputs are separate files.
- Props passed through more than two layers without being used → introduce a context.
- Repeated JSX structure → extract as a named component before proceeding.
- Use pendingComponent / errorComponent in the route definition for loading/error states.
- Wrap every page in <PageShell>. Never render <CatalogHeader> directly in a page.

## Component types

| Type     | Folder                                    | Rule                                      |
|----------|-------------------------------------------|-------------------------------------------|
| Page     | src/frontend/pages/                       | Composes features only                    |
| Feature  | src/frontend/features/<name>/components/  | May use that feature's hooks              |
| Layout   | src/frontend/components/layout/           | No data fetching, no hooks                |
| UI       | src/frontend/components/ui/               | No domain knowledge                       |
```

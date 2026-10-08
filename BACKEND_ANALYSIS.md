# Backend Analysis

## 1. Security gap — no `authorizeAdmin` middleware

`isAdmin` is **never checked by any backend route**. Any authenticated user can call `POST /species/`, `DELETE /taxonomy/:id`, `GET /users/`, etc. The admin gate lives only in the frontend `beforeLoad`. This is a real vulnerability.

**Fix:** Add an `authorizeAdmin` middleware (composing on top of `authorizeUser`) and apply it to every mutating/admin-only route.

---

## 2. No typed `AppError` class

Business errors (`"email already exists"`, `"user not found"`) are thrown as plain `Error` and caught with fragile string matching in the route (`err.message.includes("email")`). Any unrecognized error becomes a 500.

**Fix:** Create `src/backend/errors.ts` with an `AppError extends Error` that carries an HTTP status and a code string. The global `errorHandler` catches it and maps the status directly, removing all string-matching branches from routes.

---

## 3. `authorizeUser` makes 2 DB round-trips per request

It fetches the session, then fetches the user in two separate queries. A single JOIN would halve the latency on every authenticated endpoint.

---

## 4. N+1 query in `getSpecieById` taxonomy walk

The `while` loop in `species.service.ts:90` issues one `SELECT` per taxonomy node. For a deep tree (kingdom → phylum → class → order → family → genus → species) that's 7 sequential queries. Replace with a single recursive CTE — the same pattern already used in `searchSpecies`.

---

## 5. Raw string array interpolation in SQL

```ts
const idsLiteral = `{${speciesIds.join(",")}}`;
```

This line at `species.service.ts:304` builds a raw array literal into a query string, bypassing Drizzle's parameterized query protection. Drizzle's `inArray` already handles this safely and is used consistently elsewhere in the same file.

---

## 6. Route registration doesn't scale

Every new feature requires two manual edits in `app.ts` (an import and an `app.use`). An index file per feature folder that exports the router, combined with a glob-register pattern in `app.ts`, would let you add a feature without touching `app.ts`.

---

## 7. Schema typo baked into DB column

```ts
speciesRoot: integer("sepecies")  // typo: "sepecies" not "species"
```

At `schema.ts:45` — the typo is now the actual DB column name and will persist until a migration explicitly renames it.

---

## Priority order

| Priority | Item |
|---|---|
| Now (security) | #1 `authorizeAdmin` middleware |
| Now (security) | #5 raw SQL array interpolation |
| Soon (correctness) | #2 `AppError` class |
| Soon (correctness) | #3 two-query auth |
| Soon (correctness) | #4 N+1 taxonomy walk |
| Maintenance | #6 route registration pattern |
| Tech debt | #7 schema typo |

Cria o esqueleto de uma nova feature seguindo os padrões deste projeto.

## Argumento

$ARGUMENTS deve ser o nome da feature no formato `<kebab> <PascalSingular>`.
Exemplos: `specimens Specimen`, `taxonomy TaxonomyNode`, `images Image`.

Se o argumento estiver ausente ou incompleto, pergunte:
1. Nome em kebab-case (usado em caminhos de arquivo e URL): ex. `specimens`
2. Nome em PascalCase no singular (usado em tipos e nomes de componente): ex. `Specimen`

---

## O que criar

Substitua `<kebab>` pelo nome kebab e `<Pascal>` pelo nome PascalCase fornecido.

### Backend

**`src/backend/http/features/<kebab>/<kebab>.schema.ts`**
```ts
import { z } from "zod";

// ─── Response schemas ────────────────────────────────────────────────────────

export const <camel>BaseSchema = z.object({
  id: z.number(),
});
export type <Pascal>Base = z.infer<typeof <camel>BaseSchema>;

export const <camel>ResponseSchema = z.object({
  <camel>: <camel>BaseSchema,
});

export const <camel>ListResponseSchema = z.object({
  <camel>s: z.array(<camel>BaseSchema),
});

// ─── Request schemas ─────────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

**`src/backend/http/features/<kebab>/<kebab>.service.ts`**
```ts
import { db } from "@/backend/db/drizzle";

export const <SNAKE_UPPER>_SERVICE = {
  getAll: async () => {
    // TODO: implementar
    return [];
  },

  getById: async (id: number) => {
    // TODO: implementar
    return null;
  },
};
```

**`src/backend/http/features/<kebab>/<kebab>.route.ts`**
```ts
import { Router } from "express";
import { <SNAKE_UPPER>_SERVICE } from "./<kebab>.service";
import { idParamSchema } from "./<kebab>.schema";

export const <camel>Router = Router();

<camel>Router.get("/<kebab>/", async (_req, res, next) => {
  try {
    const items = await <SNAKE_UPPER>_SERVICE.getAll();
    return res.status(200).json({ <kebab>s: items });
  } catch (err) {
    next(err);
  }
});

<camel>Router.get("/<kebab>/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const item = await <SNAKE_UPPER>_SERVICE.getById(id);
    if (!item) return res.status(404).json({ message: "<Pascal> não encontrado" });
    return res.status(200).json({ <camel>: item });
  } catch (err) {
    next(err);
  }
});
```

---

### Frontend

**`src/frontend/features/<kebab>/<kebab>.api.ts`**
```ts
import {
  <camel>ResponseSchema,
  <camel>ListResponseSchema,
} from "@/backend/http/features/<kebab>/<kebab>.schema";
import type { <Pascal>Base } from "@/backend/http/features/<kebab>/<kebab>.schema";

export type { <Pascal>Base };

export async function get<Pascal>List(): Promise<<Pascal>Base[]> {
  const res = await fetch("/api/v1/<kebab>s/");
  if (!res.ok) throw new Error("Erro ao buscar lista de <kebab>s");
  const { <kebab>s } = <camel>ListResponseSchema.parse(await res.json());
  return <kebab>s;
}

export async function get<Pascal>Details(id: number): Promise<<Pascal>Base> {
  const res = await fetch(`/api/v1/<kebab>s/${id}`);
  if (res.status === 404) throw new Error("<Pascal> não encontrado");
  if (!res.ok) throw new Error("Erro ao buscar <kebab>");
  const { <camel> } = <camel>ResponseSchema.parse(await res.json());
  return <camel>;
}
```

**`src/frontend/features/<kebab>/hooks/useGet<Pascal>Details.ts`**
```ts
import { useQuery } from "@tanstack/react-query";
import { get<Pascal>Details } from "../<kebab>.api";

export function useGet<Pascal>Details(id: number) {
  return useQuery({
    queryKey: ["<kebab>", "details", id],
    queryFn: () => get<Pascal>Details(id),
    enabled: id > 0,
    retry: false,
    staleTime: "static",
  });
}
```

**`src/frontend/pages/<Pascal>ViewPage.tsx`**
```tsx
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { useGet<Pascal>Details } from "../features/<kebab>/hooks/useGet<Pascal>Details";

export const <camel>ViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/<kebab>s/$id",
  component: <Pascal>ViewPage,
});

function <Pascal>ViewPage() {
  const { id } = <camel>ViewRoute.useParams();
  const { data, isLoading, error } = useGet<Pascal>Details(Number(id));

  if (isLoading) return <div className="min-h-screen" />;
  if (error) return <div>Erro: {error.message}</div>;
  if (!data) return null;

  return (
    <main>
      {/* TODO: implementar layout */}
    </main>
  );
}
```

---

## Passos manuais (lembrar o usuário)

Após criar os arquivos, avise que ainda é necessário registrar manualmente:

1. **`src/backend/app.ts`** — importar e registrar o router:
   ```ts
   import { <camel>Router } from "./http/features/<kebab>/<kebab>.route";
   app.use("/api/v1/", <camel>Router);
   ```

2. **`src/frontend/router.ts`** — importar e adicionar a rota:
   ```ts
   import { <camel>ViewRoute } from "./pages/<Pascal>ViewPage";
   // adicionar ao routeTree:
   rootRoute.addChildren([..., <camel>ViewRoute]);
   ```

---

## Convenções de nomenclatura (referência interna)

| Contexto | Formato | Exemplo (`specimens`) |
|---|---|---|
| Caminhos de arquivo e URL | kebab-case | `specimens`, `/specimens/:id` |
| Tipo / Interface | PascalCase singular | `Specimen` |
| Variável de serviço | SNAKE_UPPER | `SPECIMEN_SERVICE` |
| Router, hook, função | camelCase | `specimenRouter`, `useGetSpecimenDetails` |
| Schema Zod | camelCase + sufixo | `specimenBaseSchema` |

Após criar todos os arquivos, rode `npx tsc --noEmit` para verificar erros de tipagem.

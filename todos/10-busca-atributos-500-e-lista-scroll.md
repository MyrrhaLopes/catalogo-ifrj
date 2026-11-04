# 10 — Busca por atributos retorna 500 + lista sem scroll/busca

## Status
Pendente (não implementado — apenas documentado). **Causa do 500 identificada com alta confiança.**

## Pedido original
A busca por atributos na página de busca não está funcionando, retorna 500. Além disso, visualmente a lista de atributos deve ter altura máxima com scroll e um campo de busca para filtrar a lista, em vez do formato atual.

## Fluxo do endpoint
A busca por atributos **não** passa por `attribute_templates` — ela entra como parte da busca de espécies:
- Frontend: `AttributeFilters.syncToSearch` → `handleAttrsSearchChange` (`SpeciesSearchPage.tsx` L140-155, debounce 250ms) → URL `attrs` → `searchSpecies` → `GET /api/v1/species/?attrs=[{"templateId":..,"valueInBaseUnit":..,"operator":".."}]`.
- Validação: `species.route.ts` (L39) chama `speciesListQuerySchema.parse(req.query)`; `parseAttrs` (`species.schema.ts` L105-112) faz `JSON.parse` e valida `templateId` (int positivo), `valueInBaseUnit` (number), `operator` (enum, com `.catch("=")`).
- **Erro de Zod não gera 500** — `src/backend/http/middleware/errorHandler.middleware.ts` (L11-17) devolve 400 para `ZodError`. O 500 vem de uma exceção não-Zod, muito provavelmente do Postgres.

## Causa raiz (alta confiança)
Em `src/backend/http/features/species/species.service.ts`, função `buildAttrFilterCondition` (L517-535):
```ts
? sql`CAST(attr_f.value AS NUMERIC) > ${attr.valueInBaseUnit}`
...
return sql`EXISTS (
  SELECT 1 FROM attributes attr_f
  WHERE attr_f.species = s.id
    AND attr_f.attribute = ${attr.templateId}
    AND ${comparison}
)`;
```
A coluna `attributes.value` é `text` (`schema.ts` L126), e o seed real (`seed-especies-catalogo-2026-10.ts`) tem muitos valores não numéricos:
- `"1 a 5"`, `"1.5 a 10"` (L766-767)
- `"80 (em cativeiro, Heteractis magnifica)"` (L768)
- `"0.3-1.5"` (L971)
- `"200 a 300, excepcionalmente até 800"` (L1041)
- `"até 25"` (L1592)
- `"LC"`, `"DD"` (L1211, L1495), em templates com `unit: "category"` (L1206, L1487)

`CAST('1 a 5' AS NUMERIC)` dispara `invalid input syntax for type numeric` (erro Postgres `22P02`). O handler de erro cai no `console.log(err)` genérico e devolve 500. O Postgres não garante ordem de avaliação do `WHERE`, então o erro pode ocorrer mesmo filtrando um template numérico, se o plano de execução avaliar o `CAST` antes do `attr_f.attribute = X` em outras linhas.

**Para confirmar em runtime:** checar no terminal do backend se aparece erro do driver `pg` com `code: '22P02'`.

## Arquivos a serem editados

### Backend (causa do 500)
- `src/backend/http/features/species/species.service.ts` — `buildAttrFilterCondition` (L517-535): precisa proteger o `CAST` (ex: `CASE WHEN value ~ '^-?\d+(\.\d+)?$' THEN value::numeric END`), ou alguma forma de ignorar/tratar valores não numéricos sem lançar exceção.

### Frontend — lista sem scroll e sem busca
- `src/frontend/features/search/components/AttributeFilters.tsx`
  - `AddAttributeButton` (L121-167), dropdown (L152-164):
    ```tsx
    <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg">
      {available.map((t) => ( <button ... onClick={() => handleAdd(t)}>{t.label}</button> ))}
    ```
    Falta `max-h-*` + `overflow-y-auto`, e falta um `<input>` de busca filtrando `available` (hoje `available = templates.filter((t) => !usedIds.has(t.id))`, L127-128, sem filtro de texto).
  - Também não fecha ao clicar fora (o estado `open` só muda pelo próprio botão) — avaliar se vale corrigir junto.
  - Dados: `useAttributeTemplates` (`src/frontend/features/species/hooks/useAttributeTemplates.ts`, `staleTime: Infinity`) → `getAttributeTemplates` (`species.api.ts` ~L87) → `GET /api/v1/attribute-templates`, lista inteira sem paginação.

## Anotações
- Templates duplicados no seed (ex.: "Status de conservação (IUCN)" criado duas vezes, L1206 e L1487, provavelmente com ids diferentes) tornam a lista mais longa/repetida — reforça a necessidade do campo de busca.
- Vale considerar também esconder do filtro numérico os templates com `unit: "category"` (ex: "LC"/"DD"), já que comparações `>`/`<` não fazem sentido para eles — mas isso é uma correção de produto, não só do bug 500; confirmar com o usuário se é desejado.
- Este item toca o mesmo componente/arquivo do item 01 (`SearchFiltersPanel.tsx` + `AttributeFilters.tsx`) — pode ser implementado na mesma leva de trabalho da página de busca.

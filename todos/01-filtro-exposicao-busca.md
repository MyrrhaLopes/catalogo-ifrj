# 01 — Filtro por exposição na página de busca

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Adicionar na página de busca um filtro por "exposição" da espécime (`húmida` / `seca`), filtrando tanto specimens quanto espécies exibidas. Por padrão, ambas as opções devem estar selecionadas.

## Arquivos a serem editados

### Frontend
- `src/frontend/pages/SpeciesSearchPage.tsx`
  - `searchParamsSchema` (~L20-35): adicionar campo novo, ex. `exposicao: z.array(z.enum(["humida","seca"]))`, com default = ambas.
  - `buildSearchArgs` (~L160-178): incluir o novo filtro nos args enviados a `searchSpecies`.
  - `useSpeciesSearchResults` (~L180-207): hoje `useSearchSpecimens(q, includesSpecimen)` só recebe `q` — precisa passar também a exposição. Atenção: hoje `enabled: enabled && q.length > 0`, ou seja, sem texto digitado nenhum specimen aparece; revisar se isso deve mudar para o filtro de exposição funcionar sem busca textual.
  - `setSearch`/`useSearchFilterReset` (~L74-82, L227-238): o reset de filtros hoje só mantém `q` e `searchIn` — decidir se exposição reseta para "ambas".
  - `activeFilterBadgeCount` (~L250): decidir se o filtro de exposição conta como filtro ativo quando não está em "ambas".
- `src/frontend/features/search/components/SearchFiltersPanel.tsx`
  - Adicionar um bloco novo de toggle (duas opções, estilo igual ao bloco "Buscar em"), **fora** do `includesSpecies &&` atual, pois deve valer tanto para espécies quanto para specimens.
- `src/frontend/features/search/components/SearchResultsSections.tsx`, `SpecimenSearchResultCard.tsx`
  - Os rótulos "Exposição seca" / "Exposição húmida" já existem (`SpecimenSearchResultCard.tsx` ~L19) — não precisam de tradução, só reaproveitar.
- `src/frontend/features/species/hooks/useSearchSpecies.ts` e `src/frontend/features/species/species.api.ts`
  - `SearchParams` (~L60) e `searchSpecies` (~L68): incluir `exposicao` nos query params enviados (CSV, mesmo padrão de `taxNodes`).
- `src/frontend/features/specimens/hooks/useSearchSpecimens.ts` e `src/frontend/features/specimens/specimen.api.ts`
  - `searchSpecimens(q)` (~L22): precisa aceitar `exposicao` e incluir na queryKey `["specimens-search", q]`.

### Backend
- `src/backend/db/schema.ts` (L36): `exposicao: text("exposicao").$type<"humida" | "seca">().notNull()` — já existe, não precisa migração.
- `src/backend/http/features/species/species.route.ts` (L30-49): `GET /species/` — hoje só entra em modo busca se houver `q`, `page`, `taxNodes` ou `attrs` (L32-36); incluir `exposicao` nessa condição.
- `src/backend/http/features/species/species.schema.ts` (L141-158): `speciesListQuerySchema` — adicionar campo `exposicao` (reaproveitar o enum de `specimen.schema.ts`).
- `src/backend/http/features/species/species.service.ts`
  - `buildSearchWhereClause` (L537-578): adicionar uma condição `EXISTS (SELECT 1 FROM specimens sp WHERE sp.species_id = s.id AND sp.exposicao = ANY(...))`.
  - `searchSpecies` (L243-406), query `pivotRows` (L332-342): opcionalmente filtrar aqui também, para que o array `specimens` de cada espécie no resultado mostre só specimens da exposição selecionada.
- `src/backend/http/features/specimen/specimen.route.ts` (L13-31) e `specimen.schema.ts`
  - `exposicaoSchema = z.enum(["humida","seca"])` já existe (L3) — reaproveitar.
  - `specimenSearchQuerySchema` (L47): adicionar `exposicao`.
- `src/backend/http/features/specimen/specimen.service.ts`
  - `searchSpecimens` (L50-58) e `listSpecimensPaginated` (L60-77): adicionar `and(ilike(...), inArray(specimenTable.exposicao, exposicao))`. Hoje a rota só chama `searchSpecimens` quando há `q` — revisar se o filtro de exposição deve funcionar mesmo sem texto.

## Anotações
- **Decisão pendente com o usuário:** hoje uma espécie sem nenhum specimen aparece na busca. Com o filtro de exposição aplicado, ela seria excluída (porque o `EXISTS` não bate). Confirmar se, com as duas opções marcadas (padrão), o filtro simplesmente não deve ser aplicado — e se uma espécie sem specimens deve continuar aparecendo independentemente da seleção.
- Os valores no banco são `"humida"`/`"seca"` (minúsculo, sem acento) — já existem rótulos em português na UI, não é necessário mapear nada novo.
- Ver também o item 10 (busca de atributos), que toca na mesma página (`SearchFiltersPanel.tsx`).

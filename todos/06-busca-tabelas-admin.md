# 06 — Barra de busca nas tabelas de admin (specimens, atributos, imagens)

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Adicionar uma barra de busca nas tabelas de specimen, atributos e imagem no admin.

## Referência já pronta no código
A tabela de **espécies** já tem busca e serve de modelo:
- `src/frontend/features/admin/components/SpeciesTable.tsx` (L25-33) — `<Search>` + `<Input value={query} onChange={...} placeholder="Buscar espécie…" className="pl-8" />`, `emptyMessage` muda quando há busca.
- `src/frontend/features/admin/hooks/useAdminSpecies.ts` (L23-54) — `useSpeciesAdminTable`: `query` + `useDeferredValue` + `setSearch` (que reseta `page` para 1) + queryKey `["species","admin-list",page,q]`.

Componentes compartilhados (sem lógica de busca hoje, candidatos a receber um `AdminSearchInput` extraído de `SpeciesTable.tsx`):
- `src/frontend/features/admin/components/AdminTableShared.tsx` — `AdminDataTable`, `LockedCell`, `CreatedAtCell`, diálogos de confirmação.
- `src/frontend/features/admin/components/AdminTablePagination.tsx` — só paginação.

## Arquivos a serem editados por tabela

### Specimens — maior parte já existe, falta só o frontend
- `src/frontend/features/admin/components/SpecimenTable.tsx` (L269-291) — UI, usa `AdminDataTable`.
- `src/frontend/features/specimens/hooks/useAdminSpecimen.ts` (L20-41) — `useSpecimenAdminTable` hoje só tem `page`; queryKey `["specimens","admin-list",page]`. **Falta repassar `q`.**
- `src/frontend/features/specimens/specimen.api.ts` (L34-45) — `listSpecimensPaginated(page, pageSize, q?)` **já aceita `q`**, só não está sendo usado pelo hook.
- Backend **já suporta `q`**: `src/backend/http/features/specimen/specimen.route.ts` (L13-18), `specimen.service.ts` (L60-77, `ilike(specimenTable.code, %q%)`), `specimen.schema.ts` (`specimenSearchQuerySchema`, L47-51, já tem `q`). **Nenhuma mudança de backend necessária aqui.**

### Atributos (attribute templates) — precisa de backend e frontend
- `src/frontend/features/admin/components/AttributeTemplatesTable.tsx` (L145-237) — **não usa `AdminDataTable`**, usa `<Table>` do shadcn direto, com early-return no loading (cuidado: isso desmontaria um input de busca no primeiro load).
- `src/frontend/features/admin/hooks/useAdminAttributeTemplates.ts` (L22-43) — `useAttributeTemplatesAdminTable`, só `page`.
- `src/frontend/features/admin/admin.api.ts` — `getAttributeTemplatesPaginated(page, pageSize)`, URL fixa, sem `q`.
- `src/backend/http/features/attribute_templates/attribute_templates.schema.ts` — `attributeTemplateListQuerySchema` não tem `q`. **Precisa adicionar.**
- `src/backend/http/features/attribute_templates/attribute_templates.route.ts` (L13-27).
- `src/backend/http/features/attribute_templates/attribute_templates.service.ts` (L17-36) — `listPaginated` sem `where`; a contagem total também precisa do mesmo filtro (ex: `ilike` em `label`/`unit`).

### Imagens — precisa de backend e frontend
- `src/frontend/features/admin/components/ImagesTable.tsx` (L169-209) — usa `AdminDataTable`, mas faz early-return no `isLoading` (mesmo cuidado de desmontar o input).
- `src/frontend/features/admin/hooks/useAdminImages.ts` (L24-43) — `useImagesAdminTable`, só `page`.
- `src/frontend/features/images/images.api.ts` (L29-31) — `getAllImagesPaginated(page, pageSize)`, sem `q`.
- `src/backend/http/features/images/images.schema.ts` (L8-12) — `speciesIdQuerySchema` (speciesId/page/pageSize), sem `q`. **Precisa adicionar.**
- `src/backend/http/features/images/images.route.ts` (L14-28).
- `src/backend/http/features/images/images.service.ts` (L34-49) — `getAllPaginated` sem `where`; já faz `leftJoin` com `articleTable`, então dá para filtrar por `alt`/`url`/espécie.

## Anotações
- **Cuidado com early-return de loading:** `ImagesTable` e `AttributeTemplatesTable` fazem early-return durante `isLoading`, o que desmontaria o campo de busca a cada busca nova (perda de foco). `SpeciesTable`/`SpecimenTable` passam `isLoading` para `AdminDataTable` e usam `placeholderData: (prev) => prev` no `useQuery`, mantendo o input montado — replicar esse padrão nas duas tabelas que faltam.
- Vale extrair um componente `AdminSearchInput` compartilhado em `src/frontend/features/admin/components/`, já que a barra de busca de `SpeciesTable.tsx` seria duplicada 3x.

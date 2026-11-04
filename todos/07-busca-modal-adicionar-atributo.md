# 07 — Barra de busca no modal de adicionar atributo à espécie

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Adicionar uma barra de busca no modal de adicionar atributo a espécie.

## Arquivos a serem editados
- `src/frontend/features/admin/components/EditSpeciesAttributesModal.tsx`
  - Esse é o modal relevante, aberto por `AttributesEditCell` em `src/frontend/features/admin/components/SpeciesTableCells.tsx` (L159-221), ao clicar na célula de atributos da tabela de espécies no admin.
  - A tabela de atributos disponíveis está nas linhas 157-236, com `max-h-96 overflow-auto` (L157) e `templates.map(...)` (L183).
  - O `Input` do shadcn já está importado (L10) — inserir o campo de busca entre o `DialogHeader` (L155) e a tabela (L157).
  - Dados vêm de `useAttributeTemplates()` (`src/frontend/features/species/hooks/useAttributeTemplates.ts`), queryKey `["attribute-templates"]`, `staleTime: Infinity`, lista **completa, não paginada** (`getAttributeTemplates` em `species.api.ts`) — a busca pode ser feita **client-side** (filtro por `label`/`unit` sobre o array já carregado), sem precisar de novo endpoint.

## Cuidados ao implementar (nota)
- O estado `selectedIds`/`values`/`sourceUrls` é indexado por `template.id`. Filtrar apenas a **lista renderizada** (não os estados) preserva as seleções já feitas — `handleConfirm` e `isDirty` já iteram sobre `selectedIds`, não sobre a lista filtrada, então isso já funciona corretamente mesmo depois de adicionar o filtro visual.
- Vale considerar manter os atributos já selecionados sempre visíveis (mesmo que não batam com o termo buscado), para o usuário não perder a referência do que já marcou.

## Não confundir com outro componente parecido
Existe outro "Adicionar atributo" no repo que **não é este modal**:
- `src/frontend/features/search/components/AttributeFilters.tsx` (L120-171, `AddAttributeButton`) — dropdown de filtros na **página pública de busca**, não no admin. Também não tem busca hoje, mas é o alvo do item 10 desta lista (busca + lista com scroll), não deste item 07.

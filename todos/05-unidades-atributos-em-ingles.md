# 05 — Unidades dos atributos aparecem em inglês

## Status
Pendente (não implementado — apenas documentado). **Causa raiz identificada.**

## Pedido original
As unidades dos atributos (ex: "centimeter", "year") estão em inglês quando deveriam estar em português.

## Causa raiz
- `src/backend/db/schema.ts` (L113-117): `attributeTemplateTable.unit` é `text("unit")` — texto livre, sem enum.
- Houve um enum antigo (`drizzle/20260920114757_futuristic_killer_shrike/migration.sql:1`, `CREATE TYPE "units" AS ENUM('meter','minute')`), removido depois (`drizzle/20260924223609_first_vin_gonzales/migration.sql:8,12`) em favor de texto livre.
- **A origem do problema está em `.claude/commands/seed-especies.md` (L62):** a instrução do comando de seed diz explicitamente para "usar nomes de unidade em inglês, minúsculo, singular (ex: `meter`, `centimeter`, `kilogram`, `gram`, `year`)".
- O seed atual (`seed-especies-catalogo-2026-10.ts`) gerou, entre outras: `centimeter` (61x), `day` (17x), `unit` (13x), `category` (10x), `year` (10x), `meter` (6x), `celsius` (4x), `gram` (3x), `pair` (3x), `ppt` (2x).
- Nenhuma camada (backend ou frontend) traduz esse valor — ele é repassado cru em todos os pontos.

## Arquivos a serem editados

### Causa / fonte dos dados
- `.claude/commands/seed-especies.md` (L62) — instrução que manda usar inglês; contradiz outros pontos da própria UI que já pedem português (ver abaixo).
- `src/backend/db/seeds/seed-especies-catalogo-2026-10.ts` e `src/backend/db/seeds/seed-helpers.ts` (L108-125, `getOrCreateAttributeTemplate`) — onde as unidades em inglês são gravadas.

### Backend (repassa sem traduzir)
- `src/backend/http/features/attribute_templates/attribute_templates.service.ts` (L38-44, `listDistinctUnits`).
- `src/backend/http/features/species/species.service.ts` (L445, L473).

### Frontend (renderiza valor cru)
- `src/frontend/features/admin/components/AttributeTemplatesTable.tsx` (L215-220) — `InlineSearchableCell field="unit"`, sugestões vêm de `useDistinctUnits()` (também em inglês).
- `src/frontend/features/admin/components/EditSpeciesAttributesModal.tsx` (L204) — `<TableCell>{t.unit}</TableCell>`.
- `src/frontend/features/admin/components/SpeciesTableCells.tsx` (L191-192) — `{a.label}: {a.value} {a.unit}`.
- `src/frontend/features/article/components/PropertiesBlock.tsx` (L32) — mapeamento fixo incompleto, só cobre o enum antigo: `attr.unit === "meter" ? "m" : attr.unit === "minute" ? "min" : ""`. Unidades novas (`centimeter`, `year` etc.) ficam **sem sufixo nenhum**.
- `src/frontend/features/admin/components/CreateAttributeTemplateModal.tsx` (L78) e `AttributeTemplatesTable.tsx` (L177-178) — placeholder/aviso já pedem nomes em português no singular ("metro, centímetro, quilograma"), o que hoje contradiz o próprio seed.

### Dicionários parciais já existentes (podem ser estendidos)
- `src/frontend/features/search/utils/unitConversion.ts` (L4-18) — `UNIT_ALIAS`, mapeia inglês/português para uma chave canônica, mas só cobre comprimento (mm/cm/m/km) e tempo (s/min/h). Faltam `day`, `year`, `gram`, `kilogram`, `celsius`, `pair`, `unit`, `category`, `ppt`.
- `src/frontend/features/search/utils/unitLabels.ts` — `unitLabels` (cm→"centímetros", m, km, s, min, h), usado só em `src/frontend/features/search/components/AttributeFilters.tsx` (L104).

## Caminhos de correção (nota, decisão do usuário)
- **(a)** Migrar os dados existentes para português e corrigir a instrução do comando de seed (`.claude/commands/seed-especies.md`) para gerar em português a partir de agora.
- **(b)** Manter os dados em inglês no banco e criar um dicionário central de exibição (estendendo `unitLabels`/`UNIT_ALIAS`), aplicado em todos os pontos de renderização listados acima.

## Anotações
- Perguntar ao usuário qual caminho prefere (a ou b) antes de implementar — têm impacto bem diferente (migração de dados vs. camada de tradução).

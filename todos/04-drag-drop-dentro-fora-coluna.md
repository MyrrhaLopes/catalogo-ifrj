# 04 — Drag and drop para mover blocos dentro/fora de um bloco de coluna

## Status
Pendente (não implementado — apenas documentado). **Item mais complexo da lista.**

## Pedido original
A feature de arrastar para reordenar (drag and drop, via `@dnd-kit`) deve também funcionar para mover um bloco para dentro ou para fora de um bloco de coluna (um container que organiza outros blocos lado a lado).

## Estrutura atual (por que não funciona)
- Modelo de draft em `src/frontend/features/article/hooks/useArticleEditor.ts` (L5-22): `DraftSections = Record<"left"|"center"|"right", DraftItem[]>`. **Só os itens de nível superior têm `id`** (gerado por `genDraftId`). Os blocos dentro de `block.columns` são `ArticleBlock` puros, **sem id**.
- `src/frontend/features/article/components/editor/ArticleEditorSection.tsx` (L30, L33): um `useDroppable({ id: sectionKey })` e **um único** `SortableContext` por seção — cobre apenas o nível superior.
- `src/frontend/features/article/components/editor/EditorBlockItem.tsx`: `useSortable({ id: item.id })` só para itens de nível superior.
- `src/frontend/features/article/components/editor/ColumnBlockEditor.tsx`: editor da coluna, **sem nenhum dnd** — filhos renderizados com `key={blockIndex}` (L58), só podem ser adicionados (`addToColumn`, L18, que já rejeita coluna-dentro-de-coluna) ou removidos.
- `src/frontend/features/article/components/editor/ArticleEditController.tsx`:
  - `findContainer` (L27-33): só reconhece `"left"|"center"|"right"` ou ids de itens de nível superior.
  - `handleDragOver` (L45-59): só move entre seções diferentes.
  - `handleDragEnd` (L61-74): só reordena dentro da mesma seção, via `arrayMove`.
  - `DragOverlay` (L76-78): só procura `activeItem` no nível superior.
  - **Bug lateral encontrado:** quando `over` é a própria seção (`oId === sectionKey`), `toIdx = -1` e `arrayMove(prev, fromIdx, -1)` insere o item na penúltima posição em vez do fim (semântica de splice com índice negativo).
- `src/frontend/features/article/components/editor/BlockInsertZone.tsx` (L26): cria coluna com `columns: [[], []]`.
- `src/frontend/features/article/components/types.ts` e `src/backend/http/features/article/article.schema.ts`: `ColumnBlock = { type: "column"; columns: ArticleBlock[][] }`.

## Arquivos a serem editados
- `src/frontend/features/article/components/editor/ArticleEditController.tsx` — `findContainer`, `handleDragOver`, `handleDragEnd`, `DragOverlay`, e corrigir o bug do índice -1.
- `src/frontend/features/article/components/editor/ColumnBlockEditor.tsx` — adicionar `SortableContext` + `useDroppable` por coluna (hoje não tem nenhum dnd).
- `src/frontend/features/article/components/editor/ArticleEditorSection.tsx` — pode precisar expor um identificador de container mais genérico (seção ou coluna+índice).
- `src/frontend/features/article/components/editor/EditorBlockItem.tsx` — tornar os filhos de coluna também "sortable" com id estável.
- `src/frontend/features/article/hooks/useArticleEditor.ts` — modelo `DraftItem`/`DraftSections` precisa suportar um tipo de draft aninhado para os filhos de coluna (ex: `DraftColumn { columns: DraftBlockItem[][] }`), com conversão de/para `ArticleBlock` ao salvar/carregar.
- `src/frontend/features/article/hooks/useArticleEditor.test.ts` — já existe; deve receber testes novos para a lógica de mover entre níveis (ver regra do CLAUDE.md sobre testes para estruturas de dados).

## Caminho de implementação (nota, não implementar)
1. Dar ids estáveis aos filhos de coluna no draft.
2. Criar um `SortableContext` + `useDroppable` por coluna dentro de `ColumnBlockEditor`.
3. Generalizar `findContainer` para devolver um "container path" (seção simples, ou coluna+índice), e tornar `handleDragOver`/`handleDragEnd` genéricos sobre esse conceito de container.
4. Implementar a conversão `DraftItem ↔ ArticleBlock` nas duas direções (entrar na coluna / saltar para fora dela).
5. Manter a restrição existente de que apenas blocos `text`/`image` podem entrar em uma coluna (`addToColumn` já valida isso) — blocos default (TOC/SOURCES/PROPERTIES) e colunas não devem poder ser arrastados para dentro de outra coluna.

## Anotações
- Esse item depende de um redesenho de modelo de dados do editor (ids estáveis para blocos aninhados), não é só adicionar handlers de evento — vale alinhar escopo com o usuário antes de começar (conforme regra do CLAUDE.md de perguntar o escopo em features grandes).

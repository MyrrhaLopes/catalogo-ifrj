# 03 — Largura fixa das seções do artigo

## Status
Pendente (não implementado — apenas documentado). **Causa raiz confirmada.**

## Pedido original
Fixar a largura das seções dos artigos para que, mesmo quando não houver nenhum bloco de amostra, a largura não altere o visual da página.

## O que é o "bloco de amostra" (confirmado pelo usuário)
São os blocos padrão **TOC**, **Fontes** (`SOURCES`) e **Propriedades** (`PROPERTIES`) — presentes automaticamente em todo artigo, não podem ser excluídos, só têm a visibilidade alternada por um toggle.

## Causa raiz confirmada no código
- `src/backend/http/features/article/article.schema.ts` (L30): `defaultArticleBlocks = z.enum(["TOC", "SOURCES", "PROPERTIES"])`. Esses nomes ficam misturados com os blocos normais dentro dos arrays `sections.left/center/right` (L32-34) — não existe um campo "disabled" no schema persistido.
- `src/frontend/features/article/hooks/useArticleEditor.ts`:
  - `DEFAULT_SECTIONS` (L30-34) mapeia `TOC → left`, `SOURCES → center`, `PROPERTIES → right`.
  - Cada default é carregado como `DraftDefaultItem { kind: "default", name, disabled: boolean }` (L5-10). Se um default não estiver presente no conteúdo salvo, ele é adicionado ao draft já com `disabled: true` (L80-89) — ou seja, ele "existe" sempre na UI de edição, só visualmente desligado.
  - `toggleDefaultBlock(id)` (L191-203) apenas alterna o campo `disabled` no draft.
  - **O ponto decisivo:** `toDraftContent`/`convertSection` (L94-99): `items.filter((item) => item.kind === "block" || !item.disabled)`. Ou seja, **ao salvar, um default desabilitado é removido inteiramente do array da seção** — o schema não tem onde guardar "presente mas invisível".
- Isso é exatamente a causa do bug: como o item some do array `sections.right` (por exemplo) quando o usuário desliga "Propriedades", `hasRight` (`ArticleLayout.tsx` L18-20, calculado como `(content.sections.right?.length ?? 0) > 0`) passa a ser `false`, a seção direita para de ser renderizada (`ArticleContentTabs.tsx` L49-53), e a seção central (`lg:flex-1`, sem `max-w`) se expande para ocupar o espaço — mudando a largura visual da página conforme o artigo.

## Arquivos a serem editados
- `src/backend/http/features/article/article.schema.ts` — provavelmente precisa mudar a forma como os defaults são representados no schema persistido, para guardar o estado "presente, porém oculto" (hoje só existe `"TOC" | "SOURCES" | "PROPERTIES"` como string solta — pode virar um objeto `{ type: "default", name, disabled }` dentro do union de `articleSectionValues`, L32-34).
- `src/frontend/features/article/hooks/useArticleEditor.ts` — `toDraftContent`/`convertSection` (L94-99) não deve mais remover o item desabilitado do array; deve persistir o estado `disabled` junto.
- `src/frontend/features/article/components/ArticleLayout.tsx` (L18-20) — `hasLeft`/`hasCenter`/`hasRight` não podem mais depender só de `length > 0`; precisam considerar que a seção "existe" mesmo com todos os itens desabilitados, para manter a largura fixa.
- `src/frontend/features/article/components/ArticleContentTabs.tsx`
  - Seção esquerda (L20): `lg:w-44 lg:shrink-0 ... tv:w-56` — hoje só existe se `hasLeft`.
  - Seção central (L38): `min-w-0 lg:flex-1` — sem `max-w`, é quem se expande indevidamente.
  - Seção direita (L49-53): `lg:w-52 lg:shrink-0 tv:w-64` — hoje só existe se `hasRight`.
  - Provavelmente as 3 seções devem sempre reservar sua largura (`lg:w-44`/`lg:w-52`), renderizando vazio quando todos os defaults daquela seção estão desabilitados e não há nenhum outro bloco.
- `src/frontend/features/article/components/editor/ArticleEditController.tsx` (L89-128) — já renderiza as 3 colunas sempre no editor (`lg:w-44`, `lg:flex-1`, `lg:w-52`), **sem condicionar a `hasLeft/hasRight`**. Esse comportamento é o modelo a copiar para o viewer (`ArticleContentTabs.tsx`).
- `src/frontend/features/article/components/PropertiesBlock.tsx`, `SourcesBlock.tsx`, componente de TOC — devem continuar não renderizando nada quando `disabled`, mesmo que a seção ao redor mantenha a largura.

## Anotações
- Essa mudança tem impacto em como o conteúdo é persistido no banco (schema de `articleContent`) — artigos já salvos no formato antigo (sem o default presente no array quando desabilitado) precisam continuar sendo lidos corretamente; avaliar se é necessária alguma migração de leitura (fallback) ou se basta a função de parse do draft (`useArticleEditor.ts` L80-89) já cobrir esse caso ao carregar.
- Depois dessa mudança, o editor (`ArticleEditController.tsx`) e o viewer (`ArticleContentTabs.tsx`) devem ficar consistentes quanto a sempre reservar a largura das 3 colunas.

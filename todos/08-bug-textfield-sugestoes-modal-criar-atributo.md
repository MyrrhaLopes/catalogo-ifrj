# 08 — Textfield com sugestões não funciona no modal de criar novo atributo

## Status
Pendente (não implementado — apenas documentado). **Causa provável identificada, precisa validação visual antes de corrigir.**

## Pedido original
O componente de textfield com sugestões embaixo (autocomplete) não funciona corretamente no modal de criar novo atributo.

## Componente e usos
- Componente: `src/frontend/features/admin/components/SearchableField.tsx` (`SearchableField`).
- **Funciona** (fora de `Dialog`):
  - `src/frontend/features/admin/components/AttributeTemplatesTable.tsx` (L77-90, `InlineSearchableCell`) — passa `onSelect`.
  - `src/frontend/features/admin/components/TaxonomyTree.tsx` (L122-131, L391-404) — passa `onSelect`, renderizado em `AdminPage.tsx` (L154), fora de dialog.
- **Não funciona** (dentro de `Dialog`):
  - `src/frontend/features/admin/components/CreateAttributeTemplateModal.tsx` (L59-66 campo "label", L73-79 campo "unit") — está dentro de um `Dialog` e **não passa `onSelect`**.
  - **Atenção:** `TaxonomyTree.tsx` também é renderizado dentro de um `Dialog` em `CreateSpeciesModal.tsx` (L54-67) — deve sofrer do mesmo bug ali, vale confirmar ao corrigir.

## Como o componente funciona hoje
- Dropdown renderizado via `createPortal(..., document.body)` (`SearchableField.tsx` L95-138), `position: fixed`, `zIndex: 9999`.
- Posição calculada por `getBoundingClientRect()` no focus/change (L48-53).
- Seleção feita em `onMouseDown` com `e.preventDefault()` (L114-117).
- `onBlur` fecha o dropdown com `setTimeout(120)` (L88).

## Causa provável (diferença entre dentro e fora do Dialog)
1. **Principal — Radix Dialog é "modal":** o `Dialog` do shadcn/Radix (`src/frontend/components/ui/dialog.tsx`, autogerado, **não editar**) aplica `pointer-events: none` no `<body>` enquanto aberto; só o `DialogContent` (layer próprio) recebe `pointer-events: auto`. O dropdown do `SearchableField`, portado direto para `document.body`, fica **fora** do `DialogContent` e herda `pointer-events: none` — cliques/hover nas sugestões não funcionam e "atravessam" para o overlay. Além disso, o `DismissableLayer` do Radix interpreta o pointerdown fora do `Content` como clique "outside" e dispara `onOpenChange(false)` (fecha o dialog e limpa os campos). O `FocusScope` do Radix também prende o foco dentro do `Content`.
2. **Secundária — posicionamento:** o `DialogContent` tem `translate-x/y` e animação `zoom-in-95`; o campo "label" usa `autoFocus` (L65 do modal), então `updatePos()` pode rodar durante a animação de abertura e medir o rect antes de estabilizar.
3. **Menor — falta de `onSelect`:** no modal, `select()` (`SearchableField.tsx` L55-63) cai no caminho que só faz `inputRef.current?.blur()`. Não é a causa principal, mas é uma diferença de uso em relação aos locais que funcionam.

## Arquivos a serem editados
- `src/frontend/features/admin/components/SearchableField.tsx` — ajustar onde o portal é montado e/ou como ele lida com os eventos do Radix.
- `src/frontend/features/admin/components/CreateAttributeTemplateModal.tsx` — passar `onSelect` adequado, e possivelmente ajustar o `Dialog` (via props públicas do componente, sem editar `src/frontend/components/ui/dialog.tsx`, que é autogerado).
- Conferir também `src/frontend/features/admin/components/CreateSpeciesModal.tsx` (L54-67), onde `TaxonomyTree` roda dentro de um `Dialog` da mesma forma.

## Caminhos de correção (nota, não implementar)
- Renderizar o portal do dropdown **dentro** do container do próprio `Dialog` (ex: usar `DialogContent` como container do `createPortal`, ou um `Portal` do Radix com `container` apontando para o content).
- Usar as props públicas `onPointerDownOutside`/`onInteractOutside` do `DialogContent` (consumidor do componente shadcn, não o arquivo autogerado) para não fechar o dialog quando o clique for no dropdown.
- Alternativa mais estrutural: trocar `SearchableField` por `Popover` + `Command` do shadcn/ui, que já lidam com esse tipo de empilhamento (portal ancorado corretamente em relação a overlays).

## Anotações
- **Nunca editar `src/frontend/components/ui/dialog.tsx`** (regra do CLAUDE.md, autogerado pelo shadcn/ui) — qualquer ajuste deve ser feito via props do componente ou no próprio `SearchableField.tsx`.
- Ver também o item 09 (remoção do botão "+ Criar") no mesmo componente.

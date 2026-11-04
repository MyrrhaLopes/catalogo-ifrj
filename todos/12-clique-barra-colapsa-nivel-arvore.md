# 12 — Clicar na barra do nível (não só no chevron) colapsa/abre o nível

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Clicar na barra do nível na Árvore taxonômica (Admin) deve colapsar/abrir o nível, em vez de precisar clicar especificamente na setinha (chevron). Garantir que não haja bug de interação dupla — a orientação do usuário é simplesmente remover a interação de clique do ícone de chevron (deixá-lo puramente visual) e colocar o onClick de toggle na barra/row inteira.

## Arquivo a ser editado
`src/frontend/features/admin/components/TaxonomyTree.tsx`, componente `ManageTreeNode` (L335-534) — é o componente usado pela variant `"manage"`, que é a árvore da página Admin (`AdminPage.tsx` L154).

### Estado atual do chevron (L382-387)
```tsx
<button
  className="p-0 w-4 h-4 flex items-center justify-center shrink-0"
  onClick={() => onToggle(node.id)}
>
  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
</button>
```
É um `<button>` com `onClick={() => onToggle(node.id)}`, sem `stopPropagation`. **Este onClick deve ser removido**, conforme orientação do usuário (pode trocar `<button>` por `<span>` para não ficar focável/clicável por teclado, ou manter `<button>` sem `onClick`).

### Estado atual da row (L363-381)
A `<div ref={setNodeRef} ...>` (L364) **não tem `onClick` hoje**. É aqui que o `onClick={() => onToggle(node.id)}` deve ser adicionado (condicionado a `hasChildren`, já que nós-folha não têm nada para togglar).

### Elementos internos que precisam de `stopPropagation` (para não disparar o toggle da row ao clicar neles)
- Drag handle (`GripVertical`, L374-381) — **já tem** `onClick={(e) => e.stopPropagation()}` (L378), serve de padrão de referência.
- Botão Editar (`Pencil`, L463) — **não tem**, precisa adicionar.
- Botão Excluir (`Trash2`, L471) — **não tem**, precisa adicionar.
- Botões "Sim"/"Não" de confirmação de exclusão (L444-455) — **não têm**, precisam adicionar.
- Check/X do modo de edição inline (L418-432) — **não têm**, precisam adicionar.
- Inputs do modo de edição inline, incluindo `SearchableField`/`Input` (L391-417) — precisam de `stopPropagation` no clique (não no digitar) para não togglar a row ao focar/clicar no campo.

### Por que não há risco de dupla interação
Como a orientação é **remover** o onClick do chevron (não duplicar o toggle nos dois elementos), não há risco de disparo duplo entre chevron e row. O único cuidado necessário é com os controles internos listados acima, que já têm sua própria ação e não devem também acionar o toggle.

## Observação à parte (não é o pedido, mas foi notado durante a investigação)
Hoje `ManageTreeNode` sempre mostra o chevron (down/right), mesmo em nós-folha sem filhos — diferente de `DraggableNode`/`InsertTreeNode`, que só mostram chevron quando `hasChildren`/`isExpandable`. Vale confirmar com o usuário se isso deve ser ajustado também (deixar de mostrar chevron em folhas) ao implementar este item, já que troca o visual da barra.

## Referência de padrão já correto no mesmo arquivo
`InsertTreeNode` (variant `"new"`, L211-232) **já segue o padrão pedido**: o onClick de toggle está na row (L211-214: `onClick={() => { onSelect(...); if (isExpandable) onToggle(node.id); }}`), e o chevron (L226-232) é um `<span>` sem onClick próprio, com `stopPropagation` no drag handle (L221). Pode ser usado como modelo direto para `ManageTreeNode`.

## Anotações
- Escopo deste item é só a variant `"manage"` (página Admin), conforme pedido do usuário. `DraggableNode` (variant `"reorder"`) tem o mesmo padrão antigo (chevron com onClick próprio, L289-298) mas não foi mencionado no pedido — não alterar a menos que o usuário quase estenda o pedido.

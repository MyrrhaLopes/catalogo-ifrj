# 11 — Toggle "colapsar tudo / abrir tudo" na Árvore taxonômica (Admin)

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Adicionar um toggle de colapsar/abrir tudo na página de Árvore taxonômica em Admin.

## Arquivos a serem editados
- `src/frontend/features/admin/components/TaxonomyTree.tsx`
  - Estado de expand/collapse é um **único `Set<number>` centralizado** no componente raiz `TaxonomyTree` (L558): `const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());`. Não é por-nó/recursivo — é compartilhado via prop drilling para os nós filhos.
  - `toggleExpand(id)` (L605-611) alterna um id individual no Set; é passada como prop `onToggle` para `ManageTreeNode`/`DraggableNode`/`InsertTreeNode`.
  - Já existe um efeito (L598-603) que expande automaticamente os ancestrais do `selectedNodeId` quando `variant === "manage"`.
  - A árvore completa (`tree: TreeNode[]`) é computada via `useMemo` (L572-585) a partir de `nodes` (API) + `draftNodes` (rascunhos, só na variant "new").
  - **Onde adicionar o toggle global:** como `expandedIds` já é centralizado, basta:
    - "Abrir tudo": coletar todos os `id` de `allNodes`/`tree` (recursivamente) e `setExpandedIds(new Set(allIds))`.
    - "Colapsar tudo": `setExpandedIds(new Set())`.
    - Como `ManageTreeNode` só renderiza os filhos se `isExpanded` (L515, `{isExpanded && (...)}`), basta popular o Set — não é necessário mudar a lógica recursiva de renderização.
    - Nós-folha (sem filhos) podem ser incluídos ou não no Set de forma indiferente (idempotente), já que não usam `expandedIds` para nada visual.
  - JSX de onde o botão poderia entrar: perto do cabeçalho `<p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>` dentro de `renderDraggableTree` (L790), ou no JSX de renderização da variant "manage" (L736-765).
- `src/frontend/pages/AdminPage.tsx` (L146-156)
  - Onde a árvore é montada na página (`<TaxonomyTree variant="manage" selectedNodeId={selectedNodeId} />`, L154), com o título "Árvore taxonômica" (L148-153) — local mais natural para o botão de toggle, passando um callback/prop para o `TaxonomyTree`.

## Anotações
- O toggle deve valer apenas para a variant `"manage"` (a usada na página Admin), a menos que o usuário peça para as outras variants (`"new"`, usada no fluxo de criação de espécie; `"reorder"`) também terem o recurso.
- O backend (`taxonomy.service.ts`, `taxonomy.route.ts`) não tem nenhuma relação com esse item — é puro CRUD de nós, sem estado de UI.

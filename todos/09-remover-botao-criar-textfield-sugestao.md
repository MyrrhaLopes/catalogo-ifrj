# 09 — Remover botão "+ Criar 'algo'" do textfield com sugestões

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Remover o botão "+ Criar 'algo'" do componente de textfield com sugestão, pois é redundante e confunde o usuário.

## Arquivo a ser editado
Tudo concentrado em `src/frontend/features/admin/components/SearchableField.tsx`:
- L3 — `import { Plus } from "lucide-react";` (fica sem uso após a remoção, remover o import também).
- L45 — `const showCreate = q.length > 0 && filtered.length === 0;` (remover).
- L46 — `const showDropdown = open && (sorted.length > 0 || showCreate);` → passa a ser só `open && sorted.length > 0`.
- L123-135 — o botão em si:
  ```tsx
  {showCreate && (
    <button ... onMouseDown={(e) => { e.preventDefault(); select(q); }}>
      <Plus className="h-3.5 w-3.5 shrink-0" />
      Criar &ldquo;{q}&rdquo;
    </button>
  )}
  ```

## Por que é seguro remover
O botão só chama `select(q)`, que faz `onChange(q)` e fecha o dropdown (disparando `onSelect`, que em `InlineSearchableCell` faz o commit). O valor digitado já fica em `value` via `onChange` normal — o botão só duplicava a confirmação. Depois da remoção, o fluxo de "criar valor novo" continua funcionando via:
- Enter (`commit()` no `onKeyDown`) na tabela de atributos.
- O botão "Criar" do rodapé do modal (`CreateAttributeTemplateModal.tsx`), que é a ação de submit do formulário inteiro.

## Impacto — todos os usos do componente são afetados
- `src/frontend/features/admin/components/CreateAttributeTemplateModal.tsx` (campos label/unit).
- `src/frontend/features/admin/components/AttributeTemplatesTable.tsx` (`InlineSearchableCell`, edição inline na tabela).
- `src/frontend/features/admin/components/TaxonomyTree.tsx` (2 usos, L122-131 e L391-404) — aqui o botão "Criar" servia para confirmar a criação de um nível taxonômico novo via `onSelect`. Sem o botão, a confirmação continua disponível por Enter/submit do formulário da árvore — **confirmar que esse fluxo de criação de nível taxonômico continua acessível de outra forma antes de remover**, já que é o uso mais sensível dos 3.

## Anotações
- Fazer este item junto com o item 08 é natural, pois ambos tocam o mesmo arquivo (`SearchableField.tsx`), mas são conceitualmente independentes (um é bug de interação dentro de Dialog, outro é remoção de UI redundante).

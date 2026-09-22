import { useTaxonomy } from "@/frontend/features/species/hooks/useTaxonomy";
import type { TaxonomyNode } from "@/frontend/features/species/species.api";

type Props = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

function getDistinctLabels(nodes: TaxonomyNode[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const n of nodes) {
    if (!seen.has(n.label)) {
      seen.add(n.label);
      order.push(n.label);
    }
  }
  return order;
}

function isDescendantOf(
  nodeId: number,
  ancestorId: number,
  nodes: TaxonomyNode[],
): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<number>();
  let current = byId.get(nodeId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.parent === ancestorId) return true;
    if (current.parent === current.id) break; // root
    current = byId.get(current.parent);
  }
  return false;
}

export function TaxonomyFilters({ selectedIds, onChange }: Props) {
  const { data: nodes = [], isLoading } = useTaxonomy();

  if (isLoading) return <p className="text-xs text-neutral-400">Carregando...</p>;

  const labels = getDistinctLabels(nodes);

  function getSelectedAtLabel(label: string): number | null {
    const atLabel = nodes.filter((n) => n.label === label);
    return atLabel.find((n) => selectedIds.includes(n.id))?.id ?? null;
  }

  function getValidOptionsForLabel(label: string): TaxonomyNode[] {
    const labelIndex = labels.indexOf(label);
    const prevLabels = labels.slice(0, labelIndex);

    // Find the last selected ancestor (nearest ancestor in the selected chain)
    let ancestorId: number | null = null;
    for (let i = prevLabels.length - 1; i >= 0; i--) {
      const sel = getSelectedAtLabel(prevLabels[i]);
      if (sel !== null) {
        ancestorId = sel;
        break;
      }
    }

    const candidates = nodes.filter((n) => n.label === label);
    if (ancestorId === null) return candidates;

    return candidates.filter(
      (n) => n.parent === ancestorId || isDescendantOf(n.id, ancestorId!, nodes),
    );
  }

  function handleSelect(label: string, nodeId: number | null) {
    const labelIndex = labels.indexOf(label);

    // Remove selections at this level and all subsequent levels
    const labelsToReset = labels.slice(labelIndex);
    const idsToRemove = new Set(
      nodes.filter((n) => labelsToReset.includes(n.label)).map((n) => n.id),
    );
    const next = selectedIds.filter((id) => !idsToRemove.has(id));

    if (nodeId !== null) next.push(nodeId);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {labels.map((label) => {
        const options = getValidOptionsForLabel(label);
        const selected = getSelectedAtLabel(label);
        return (
          <div key={label}>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              {label}
            </label>
            <select
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selected ?? ""}
              onChange={(e) =>
                handleSelect(label, e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Selecionar {label.toLowerCase()}</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelValue}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

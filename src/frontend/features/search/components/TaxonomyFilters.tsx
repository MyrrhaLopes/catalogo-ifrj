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

function isDescendantOf(nodeId: number, ancestorId: number, nodes: TaxonomyNode[]): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<number>();
  let current = byId.get(nodeId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.parent === ancestorId) return true;
    if (current.parent === current.id) break;
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

  function handleSelect(label: string, value: string) {
    const nodeId = value === "" ? null : Number(value);
    const labelIndex = labels.indexOf(label);
    const labelsToReset = labels.slice(labelIndex);
    const idsToRemove = new Set(
      nodes.filter((n) => labelsToReset.includes(n.label)).map((n) => n.id),
    );
    const next = selectedIds.filter((id) => !idsToRemove.has(id));
    if (nodeId !== null) next.push(nodeId);
    onChange(next);
  }

  // Only show levels up to (lastSelected + 1)
  let lastSelectedIndex = -1;
  for (let i = 0; i < labels.length; i++) {
    if (getSelectedAtLabel(labels[i]) !== null) lastSelectedIndex = i;
  }
  const visibleLabels = labels.slice(0, lastSelectedIndex + 2);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="space-y-4">
        {visibleLabels.map((label, index) => {
          const options = getValidOptionsForLabel(label);
          const selected = getSelectedAtLabel(label);
          const isChild = index > 0;

          return (
            <div key={label} className={isChild ? "pl-3" : ""}>
              <p className="mb-1.5 text-sm text-neutral-600">{label}</p>
              <select
                className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selected ?? ""}
                onChange={(e) => handleSelect(label, e.target.value)}
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
    </div>
  );
}

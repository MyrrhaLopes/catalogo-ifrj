import { useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import {
  toBaseUnit,
  getDisplayUnits,
  type DisplayUnit,
} from "../utils/unitConversion";
import { unitLabels } from "../utils/unitLabels";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import { Input } from "@/frontend/components/ui/input";

export type ActiveAttrFilter = {
  templateId: number;
  template: AttributeTemplate;
  displayValue: string;
  displayUnit: DisplayUnit;
};

type FilterListProps = {
  filters: ActiveAttrFilter[];
  onChange: (filters: ActiveAttrFilter[]) => void;
  onSearchChange: (attrs: Array<{ templateId: number; valueInBaseUnit: number }>) => void;
};

/** Renders the active attribute filter rows inside a card. No add button — use AddAttributeButton for that. */
export function AttributeFilters({ filters, onChange, onSearchChange }: FilterListProps) {
  function removeFilter(templateId: number) {
    const next = filters.filter((f) => f.templateId !== templateId);
    onChange(next);
    syncToSearch(next);
  }

  function updateFilter(
    templateId: number,
    patch: Partial<Pick<ActiveAttrFilter, "displayValue" | "displayUnit">>,
  ) {
    const next = filters.map((f) => (f.templateId === templateId ? { ...f, ...patch } : f));
    onChange(next);
    syncToSearch(next);
  }

  function syncToSearch(current: ActiveAttrFilter[]) {
    const attrs = current
      .filter((f) => f.displayValue !== "" && !isNaN(Number(f.displayValue)))
      .map((f) => ({
        templateId: f.templateId,
        valueInBaseUnit: toBaseUnit(Number(f.displayValue), f.displayUnit, f.template.unit),
      }));
    onSearchChange(attrs);
  }

  if (filters.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="space-y-3">
        {filters.map((f) => (
          <div key={f.templateId} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
              {f.template.label}
            </span>
            <Input
              type="number"
              className="w-16 px-2 py-1 text-sm"
              value={f.displayValue}
              onChange={(e) => updateFilter(f.templateId, { displayValue: e.target.value })}
              placeholder="0"
            />
            <select
              className="rounded-md border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={f.displayUnit}
              onChange={(e) =>
                updateFilter(f.templateId, { displayUnit: e.target.value as DisplayUnit })
              }
            >
              {getDisplayUnits(f.template.unit).map((u) => (
                <option key={u} value={u}>
                  {unitLabels[u] ?? u}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeFilter(f.templateId)}
              className="shrink-0 text-neutral-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type AddButtonProps = {
  activeFilters: ActiveAttrFilter[];
  onAdd: (filter: ActiveAttrFilter) => void;
};

/** Standalone "Adicionar atributo" dropdown — place this wherever needed in the parent layout. */
export function AddAttributeButton({ activeFilters, onAdd }: AddButtonProps) {
  const { data: templates = [], isLoading } = useAttributeTemplates();
  const [open, setOpen] = useState(false);

  if (isLoading) return null;

  const usedIds = new Set(activeFilters.map((f) => f.templateId));
  const available = templates.filter((t) => !usedIds.has(t.id));

  if (available.length === 0) return null;

  function handleAdd(template: AttributeTemplate) {
    const units = getDisplayUnits(template.unit);
    const defaultUnit = units[1] as DisplayUnit;
    onAdd({ templateId: template.id, template, displayValue: "", displayUnit: defaultUnit });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-green-500 hover:text-green-700"
      >
        Adicionar atributo
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg">
          {available.map((t) => (
            <button
              key={t.id}
              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50"
              onClick={() => handleAdd(t)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

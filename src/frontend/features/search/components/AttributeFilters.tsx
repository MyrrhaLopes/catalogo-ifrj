import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import {
  toBaseUnit,
  getDisplayUnits,
  type DisplayUnit,
} from "../utils/unitConversion";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";

export type ActiveAttrFilter = {
  templateId: number;
  template: AttributeTemplate;
  displayValue: string;
  displayUnit: DisplayUnit;
};

type Props = {
  filters: ActiveAttrFilter[];
  onChange: (filters: ActiveAttrFilter[]) => void;
  onSearchChange: (attrs: Array<{ templateId: number; valueInBaseUnit: number }>) => void;
};

export function AttributeFilters({ filters, onChange, onSearchChange }: Props) {
  const { data: templates = [], isLoading } = useAttributeTemplates();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const usedTemplateIds = new Set(filters.map((f) => f.templateId));
  const availableTemplates = templates.filter((t) => !usedTemplateIds.has(t.id));

  function addFilter(template: AttributeTemplate) {
    const units = getDisplayUnits(template.unit);
    const defaultUnit = units[1] as DisplayUnit; // "m" or "min"
    const next = [...filters, { templateId: template.id, template, displayValue: "", displayUnit: defaultUnit }];
    onChange(next);
    setDropdownOpen(false);
  }

  function removeFilter(templateId: number) {
    const next = filters.filter((f) => f.templateId !== templateId);
    onChange(next);
    syncToSearch(next);
  }

  function updateFilter(templateId: number, patch: Partial<Pick<ActiveAttrFilter, "displayValue" | "displayUnit">>) {
    const next = filters.map((f) =>
      f.templateId === templateId ? { ...f, ...patch } : f,
    );
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

  if (isLoading) return null;

  return (
    <div className="space-y-3">
      {filters.map((f) => (
        <div key={f.templateId} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-700">
            {f.template.label}
          </span>
          <input
            type="number"
            className="w-20 rounded-md border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={f.displayValue}
            onChange={(e) => updateFilter(f.templateId, { displayValue: e.target.value })}
            placeholder="0"
          />
          <select
            className="rounded-md border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={f.displayUnit}
            onChange={(e) => updateFilter(f.templateId, { displayUnit: e.target.value as DisplayUnit })}
          >
            {getDisplayUnits(f.template.unit).map((u) => (
              <option key={u} value={u}>
                {u}
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

      {availableTemplates.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 transition-colors hover:border-green-500 hover:text-green-700"
          >
            + Adicionar atributo
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg">
              {availableTemplates.map((t) => (
                <button
                  key={t.id}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50"
                  onClick={() => addFilter(t)}
                >
                  {t.label}{" "}
                  <span className="text-xs text-neutral-400">({t.unit})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { toBaseUnit, type DisplayUnit } from "../utils/unitConversion";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import { NumericAttrFilterRow } from "./NumericAttrFilterRow";
import { CategoricalAttrFilterRow } from "./CategoricalAttrFilterRow";

export type AttrOperator = "=" | ">" | "<" | ">=" | "<=" | "entre";

export type NumericActiveAttrFilter = {
  kind: "numeric";
  templateId: number;
  template: AttributeTemplate;
  displayValue: string;
  displayValue2: string;
  displayUnit: DisplayUnit;
  operator: AttrOperator;
};

export type CategoricalActiveAttrFilter = {
  kind: "categorical";
  templateId: number;
  template: AttributeTemplate;
  selectedValues: string[];
};

export type ActiveAttrFilter = NumericActiveAttrFilter | CategoricalActiveAttrFilter;

export type AttrSearchEntry =
  | {
      kind: "numeric";
      templateId: number;
      valueInBaseUnit: number;
      valueInBaseUnit2?: number;
      operator: AttrOperator;
      displayUnit: string;
    }
  | { kind: "categorical"; templateId: number; values: string[] };

type FilterListProps = {
  filters: ActiveAttrFilter[];
  onChange: (filters: ActiveAttrFilter[]) => void;
  onSearchChange: (attrs: AttrSearchEntry[]) => void;
};

function toSearchEntry(f: ActiveAttrFilter): AttrSearchEntry | null {
  if (f.kind === "categorical") {
    return f.selectedValues.length > 0
      ? { kind: "categorical", templateId: f.templateId, values: f.selectedValues }
      : null;
  }
  if (f.displayValue === "" || isNaN(Number(f.displayValue))) return null;
  if (f.operator === "entre" && (f.displayValue2 === "" || isNaN(Number(f.displayValue2)))) return null;
  return {
    kind: "numeric",
    templateId: f.templateId,
    valueInBaseUnit: toBaseUnit(Number(f.displayValue), f.displayUnit, f.template.unit),
    valueInBaseUnit2:
      f.operator === "entre" ? toBaseUnit(Number(f.displayValue2), f.displayUnit, f.template.unit) : undefined,
    operator: f.operator,
    displayUnit: f.displayUnit,
  };
}

/** Renders the active attribute filter rows inside a card. No add button — use AddAttributeButton for that. */
export function AttributeFilters({ filters, onChange, onSearchChange }: FilterListProps) {
  function removeFilter(templateId: number) {
    const next = filters.filter((f) => f.templateId !== templateId);
    onChange(next);
    syncToSearch(next);
  }

  function updateFilter(templateId: number, patch: Partial<NumericActiveAttrFilter> | Partial<CategoricalActiveAttrFilter>) {
    const next = filters.map((f) => (f.templateId === templateId ? ({ ...f, ...patch } as ActiveAttrFilter) : f));
    onChange(next);
    syncToSearch(next);
  }

  function syncToSearch(current: ActiveAttrFilter[]) {
    const attrs = current.map(toSearchEntry).filter((e): e is AttrSearchEntry => e !== null);
    onSearchChange(attrs);
  }

  if (filters.length === 0) return null;

  return (
    <div className="space-y-2">
      {filters.map((f) => (
        <div key={f.templateId} className="rounded-xl border border-neutral-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">{f.template.label}</span>
            <button
              onClick={() => removeFilter(f.templateId)}
              className="shrink-0 text-neutral-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {f.kind === "numeric" ? (
            <NumericAttrFilterRow filter={f} onChange={(patch) => updateFilter(f.templateId, patch)} />
          ) : (
            <CategoricalAttrFilterRow
              filter={f}
              onChange={(selectedValues) => updateFilter(f.templateId, { selectedValues })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

import { getDisplayUnits, type DisplayUnit } from "../utils/unitConversion";
import { unitLabels } from "../utils/unitLabels";
import { Input } from "@/frontend/components/ui/input";
import type { NumericActiveAttrFilter, AttrOperator } from "./AttributeFilters";

const OPERATOR_LABELS: Record<AttrOperator, string> = {
  "=": "=",
  ">": ">",
  "<": "<",
  ">=": "≥",
  "<=": "≤",
  entre: "entre",
};

type Props = {
  filter: NumericActiveAttrFilter;
  onChange: (
    patch: Partial<Pick<NumericActiveAttrFilter, "displayValue" | "displayValue2" | "displayUnit" | "operator">>,
  ) => void;
};

/** Operador + valor(es) + unidade para um atributo numérico — linha de AttributeFilters. */
export function NumericAttrFilterRow({ filter: f, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          className="min-w-0 flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          value={f.operator}
          onChange={(e) => onChange({ operator: e.target.value as AttrOperator })}
        >
          {(Object.keys(OPERATOR_LABELS) as AttrOperator[]).map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>
        {f.operator !== "entre" && (
          <Input
            type="number"
            className="min-w-0 flex-1 px-2 py-1 text-sm"
            value={f.displayValue}
            onChange={(e) => onChange({ displayValue: e.target.value })}
            placeholder="0"
          />
        )}
        <select
          className="min-w-0 flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={f.displayUnit}
          onChange={(e) => onChange({ displayUnit: e.target.value as DisplayUnit })}
        >
          {getDisplayUnits(f.template.unit).map((u) => (
            <option key={u} value={u}>
              {unitLabels[u] ?? u}
            </option>
          ))}
        </select>
      </div>
      {f.operator === "entre" && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="min-w-0 flex-1 px-2 py-1 text-sm"
            value={f.displayValue}
            onChange={(e) => onChange({ displayValue: e.target.value })}
            placeholder="mín."
          />
          <span className="shrink-0 text-xs text-neutral-500">até</span>
          <Input
            type="number"
            className="min-w-0 flex-1 px-2 py-1 text-sm"
            value={f.displayValue2}
            onChange={(e) => onChange({ displayValue2: e.target.value })}
            placeholder="máx."
          />
        </div>
      )}
    </div>
  );
}

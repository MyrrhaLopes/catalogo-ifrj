import { cn } from "@/lib/utils";
import { TaxonomyFilters } from "./TaxonomyFilters";
import {
  AttributeFilters,
  AddAttributeButton,
  type ActiveAttrFilter,
  type AttrOperator,
} from "./AttributeFilters";

type SearchIn = "species" | "specimen" | "both";

type Props = {
  searchIn: SearchIn;
  onToggleSearchIn: (type: "species" | "specimen") => void;
  includesSpecies: boolean;
  taxNodes: number[];
  onTaxNodesChange: (ids: number[]) => void;
  activeFilters: ActiveAttrFilter[];
  onActiveFiltersChange: (filters: ActiveAttrFilter[]) => void;
  onAttrsSearchChange: (
    attrs: Array<{ templateId: number; valueInBaseUnit: number; operator: AttrOperator; displayUnit: string }>,
  ) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function SearchFiltersPanel({
  searchIn,
  onToggleSearchIn,
  includesSpecies,
  taxNodes,
  onTaxNodesChange,
  activeFilters,
  onActiveFiltersChange,
  onAttrsSearchChange,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Search type toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Buscar em
        </p>
        <div className="flex gap-2">
          {(
            [
              { key: "species", label: "Espécies" },
              { key: "specimen", label: "Espécimes" },
            ] as const
          ).map(({ key, label }) => {
            const active = searchIn === key || searchIn === "both";
            return (
              <button
                key={key}
                onClick={() => onToggleSearchIn(key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors tv:text-sm",
                  active
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Taxonomy filters — only shown when species is included */}
      {includesSpecies && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Níveis taxonômicos
          </p>
          <TaxonomyFilters selectedIds={taxNodes} onChange={onTaxNodesChange} />
        </div>
      )}

      {/* Attribute filters — only shown when species is included */}
      {includesSpecies && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Atributos
            </p>
            <AddAttributeButton
              activeFilters={activeFilters}
              onAdd={(filter) => onActiveFiltersChange([...activeFilters, filter])}
            />
          </div>
          <AttributeFilters
            filters={activeFilters}
            onChange={onActiveFiltersChange}
            onSearchChange={onAttrsSearchChange}
          />
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          className="text-xs text-neutral-400 hover:text-red-500"
          onClick={onClearFilters}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

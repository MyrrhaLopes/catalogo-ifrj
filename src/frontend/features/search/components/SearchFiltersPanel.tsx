import { TaxonomyFilters } from "./TaxonomyFilters";
import { TogglePillGroup } from "./TogglePillGroup";
import { AttributeFilters, type ActiveAttrFilter, type AttrSearchEntry } from "./AttributeFilters";
import { AddAttributeButton } from "./AddAttributeButton";

const SEARCH_IN_OPTIONS = [
  { key: "species", label: "Espécies" },
  { key: "specimen", label: "Espécimes" },
] as const;

const EXPOSICAO_OPTIONS = [
  { key: "seca", label: "Exposição seca" },
  { key: "humida", label: "Exposição húmida" },
] as const;

type SearchIn = "species" | "specimen" | "both";
type Exposicao = "humida" | "seca";

type Props = {
  searchIn: SearchIn;
  onToggleSearchIn: (type: "species" | "specimen") => void;
  exposicao: Exposicao[];
  onToggleExposicao: (type: Exposicao) => void;
  includesSpecies: boolean;
  taxNodes: number[];
  onTaxNodesChange: (ids: number[]) => void;
  activeFilters: ActiveAttrFilter[];
  onActiveFiltersChange: (filters: ActiveAttrFilter[]) => void;
  onAttrsSearchChange: (attrs: AttrSearchEntry[]) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function SearchFiltersPanel({
  searchIn,
  onToggleSearchIn,
  exposicao,
  onToggleExposicao,
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
      <TogglePillGroup
        title="Buscar em"
        options={SEARCH_IN_OPTIONS}
        isActive={(key) => searchIn === key || searchIn === "both"}
        onToggle={onToggleSearchIn}
      />

      {/* Vale tanto para espécies quanto para espécimes, por isso fica fora do includesSpecies */}
      <TogglePillGroup
        title="Exposição"
        options={EXPOSICAO_OPTIONS}
        isActive={(key) => exposicao.includes(key)}
        onToggle={onToggleExposicao}
      />

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

import { createRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { rootRoute } from "../rootRoute";
import { CatalogHeader } from "../components/CatalogHeader";
import { useSearchSpecies } from "../features/species/hooks/useSearchSpecies";
import { useSearchSpecimens } from "../features/specimens/hooks/useSearchSpecimens";
import { SpeciesSearchResultCard } from "../features/search/components/SpeciesSearchResultCard";
import { SpecimenSearchResultCard } from "../features/search/components/SpecimenSearchResultCard";
import { TaxonomyFilters } from "../features/search/components/TaxonomyFilters";
import {
  AttributeFilters,
  AddAttributeButton,
  type ActiveAttrFilter,
} from "../features/search/components/AttributeFilters";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { cn } from "../shared/utils";

const searchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  taxNodes: z.array(z.number()).optional(),
  attrs: z
    .array(
      z.object({
        tid: z.number(),
        val: z.number(),
        displayUnit: z.string(),
      }),
    )
    .optional(),
  searchIn: z.enum(["species", "specimen", "both"]).default("species"),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const speciesSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/especies/buscar",
  validateSearch: (search: Record<string, unknown>): SearchParams =>
    searchParamsSchema.parse(search),
  component: SpeciesSearchPage,
});

const PAGE_SIZE = 20;

const ROUTE = "/especies/buscar" as const;

function SpeciesSearchPage() {
  const navigate = useNavigate();
  const search = speciesSearchRoute.useSearch();

  const q = search.q ?? "";
  const page = (search.page ?? 1) as number;
  const taxNodes = search.taxNodes ?? [];
  const urlAttrs = search.attrs ?? [];
  const searchIn = search.searchIn;

  const [activeFilters, setActiveFilters] = useState<ActiveAttrFilter[]>([]);
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attrs = urlAttrs.map((a) => ({ templateId: a.tid, valueInBaseUnit: a.val }));

  const includesSpecies = searchIn === "species" || searchIn === "both";
  const includesSpecimen = searchIn === "specimen" || searchIn === "both";

  const { data: speciesData, isLoading: speciesLoading } = useSearchSpecies({
    q: q || undefined,
    page,
    pageSize: PAGE_SIZE,
    taxNodes: taxNodes.length > 0 ? taxNodes : undefined,
    attrs: attrs.length > 0 ? attrs : undefined,
  });

  const { data: specimenData, isLoading: specimenLoading } = useSearchSpecimens(
    q,
    includesSpecimen,
  );

  const setSearch = useCallback(
    (patch: Partial<SearchParams>) => {
      navigate({
        to: ROUTE,
        search: (prev) => ({ ...prev, searchIn: prev.searchIn ?? "species", ...patch, page: 1 }),
      });
    },
    [navigate],
  );

  function handleInputChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch({ q: value || undefined }), 300);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSearch({ q: inputValue || undefined });
    }
  }

  function handleTaxNodesChange(ids: number[]) {
    setSearch({ taxNodes: ids.length > 0 ? ids : undefined });
  }

  function handleAttrsSearchChange(
    searchAttrs: Array<{ templateId: number; valueInBaseUnit: number }>,
  ) {
    navigate({
      to: ROUTE,
      search: (prev) => ({
        ...prev,
        searchIn: prev.searchIn ?? "species",
        page: 1,
        attrs:
          searchAttrs.length > 0
            ? searchAttrs.map((a) => ({
                tid: a.templateId,
                val: a.valueInBaseUnit,
                displayUnit: "",
              }))
            : undefined,
      }),
    });
  }

  function toggleSearchIn(type: "species" | "specimen") {
    if (searchIn === type) return; // already the only one active — keep it
    const next: SearchParams["searchIn"] =
      searchIn === "both" ? (type === "species" ? "specimen" : "species") : "both";
    setSearch({ searchIn: next });
  }

  const speciesTotal = speciesData?.total ?? 0;
  const totalPages = Math.ceil(speciesTotal / PAGE_SIZE);
  const specimensList = specimenData?.specimens ?? [];

  const isLoading = (includesSpecies && speciesLoading) || (includesSpecimen && specimenLoading);

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      <div className="mx-auto max-w-screen-xl px-6 py-8">
        {/* Search input */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar espécie ou espécime..."
            className="pl-9"
          />
        </div>

        {q && (
          <h2 className="mb-6 text-xl text-neutral-700">
            Buscando por <strong className="text-neutral-900">"{q}"</strong>
          </h2>
        )}

        <div className="flex gap-8">
          {/* Results */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <p className="text-sm text-neutral-400">Carregando...</p>
            ) : (
              <>
                {/* Species results */}
                {includesSpecies && (
                  <section className={searchIn === "both" ? "mb-8" : ""}>
                    {searchIn === "both" && (
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                        Espécies ({speciesTotal})
                      </h3>
                    )}
                    {!speciesData || speciesData.species.length === 0 ? (
                      <p className="text-sm text-neutral-400">
                        {q ? `Nenhuma espécie para "${q}".` : "Nenhuma espécie encontrada."}
                      </p>
                    ) : (
                      <>
                        {searchIn === "species" && (
                          <div className="mb-4 text-xs text-neutral-500">
                            {speciesTotal} {speciesTotal === 1 ? "resultado" : "resultados"}
                          </div>
                        )}
                        <div className="space-y-3">
                          {speciesData.species.map((s) => (
                            <SpeciesSearchResultCard key={s.id} species={s} query={q} />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                              className="rounded-md border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40"
                              disabled={page <= 1}
                              onClick={() =>
                                navigate({
                                  to: ROUTE,
                                  search: (p) => ({ ...p, searchIn: p.searchIn ?? "species", page: page - 1 }),
                                })
                              }
                            >
                              Anterior
                            </button>
                            <span className="text-sm text-neutral-600">
                              {page} / {totalPages}
                            </span>
                            <button
                              className="rounded-md border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40"
                              disabled={page >= totalPages}
                              onClick={() =>
                                navigate({
                                  to: ROUTE,
                                  search: (p) => ({ ...p, searchIn: p.searchIn ?? "species", page: page + 1 }),
                                })
                              }
                            >
                              Próxima
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}

                {/* Specimen results */}
                {includesSpecimen && (
                  <section>
                    {searchIn === "both" && (
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                        Espécimes ({specimensList.length})
                      </h3>
                    )}
                    {specimensList.length === 0 ? (
                      <p className="text-sm text-neutral-400">
                        {q
                          ? `Nenhum espécime para "${q}".`
                          : "Digite um código para buscar espécimes."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {specimensList.map((s) => (
                          <SpecimenSearchResultCard key={s.id} specimen={s} />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>

          {/* Filters panel */}
          <aside className="w-72 shrink-0">
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
                        onClick={() => toggleSearchIn(key)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
                  <TaxonomyFilters selectedIds={taxNodes} onChange={handleTaxNodesChange} />
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
                      onAdd={(filter) => setActiveFilters((prev) => [...prev, filter])}
                    />
                  </div>
                  <AttributeFilters
                    filters={activeFilters}
                    onChange={setActiveFilters}
                    onSearchChange={handleAttrsSearchChange}
                  />
                </div>
              )}

              {/* Clear filters */}
              {(taxNodes.length > 0 || urlAttrs.length > 0) && (
                <button
                  className="text-xs text-neutral-400 hover:text-red-500"
                  onClick={() => {
                    setActiveFilters([]);
                    navigate({
                      to: ROUTE,
                      search: (p) => ({ q: p.q, searchIn: p.searchIn ?? "species", page: 1 }),
                    });
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

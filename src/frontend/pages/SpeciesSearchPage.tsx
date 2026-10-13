import { createRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import { useSearchSpecies } from "../features/species/hooks/useSearchSpecies";
import { useSearchSpecimens } from "../features/specimens/hooks/useSearchSpecimens";
import { useAttributeTemplates } from "../features/species/hooks/useAttributeTemplates";
import { SpeciesSearchResultCard } from "../features/search/components/SpeciesSearchResultCard";
import { SpecimenSearchResultCard } from "../features/search/components/SpecimenSearchResultCard";
import { SearchFiltersPanel } from "../features/search/components/SearchFiltersPanel";
import { type ActiveAttrFilter, type AttrOperator } from "../features/search/components/AttributeFilters";
import { fromBaseUnit, getDefaultDisplayUnit } from "../features/search/utils/unitConversion";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";

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
        op: z.enum(["=", ">", "<"]).catch("="),
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitFromUrl = useRef(false);

  const { data: templates = [] } = useAttributeTemplates();

  useEffect(() => {
    if (didInitFromUrl.current) return;
    if (urlAttrs.length === 0) return;
    if (templates.length === 0) return;

    didInitFromUrl.current = true;
    const filters: ActiveAttrFilter[] = urlAttrs.flatMap((a) => {
      const template = templates.find((t) => t.id === a.tid);
      if (!template) return [];
      const displayUnit = a.displayUnit || getDefaultDisplayUnit(template.unit);
      const displayValue = fromBaseUnit(a.val, displayUnit, template.unit).toString();
      return [{ templateId: a.tid, template, displayValue, displayUnit, operator: a.op as AttrOperator }];
    });
    setActiveFilters(filters);
  }, [templates]);

  const attrs = urlAttrs.map((a) => ({
    templateId: a.tid,
    valueInBaseUnit: a.val,
    operator: a.op as AttrOperator,
  }));

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
    searchAttrs: Array<{ templateId: number; valueInBaseUnit: number; operator: AttrOperator; displayUnit: string }>,
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
                displayUnit: a.displayUnit,
                op: a.operator,
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
    <PageShell className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 md:py-8 tv:max-w-screen-2xl tv:px-10">
        {/* Search input + mobile filters toggle */}
        <div className="mb-4 flex gap-3 md:mb-6">
          <div className="relative max-w-md flex-1">
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
          <button
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {(taxNodes.length > 0 || urlAttrs.length > 0) && (
              <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">
                {taxNodes.length + urlAttrs.length}
              </span>
            )}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mobileFiltersOpen && "rotate-180")} />
          </button>
        </div>

        {q && (
          <h2 className="mb-6 text-lg text-neutral-700 md:text-xl">
            Buscando por <strong className="text-neutral-900">"{q}"</strong>
          </h2>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 tv:gap-12">
          {/* Results */}
          <div className="order-2 min-w-0 flex-1 lg:order-1">
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
          <aside
            className={cn(
              "order-1 lg:order-2 lg:block lg:w-72 lg:shrink-0 tv:w-80",
              mobileFiltersOpen ? "block" : "hidden",
            )}
          >
            <div className="rounded-lg border border-neutral-200 p-4 lg:border-0 lg:p-0">
              <SearchFiltersPanel
                searchIn={searchIn}
                onToggleSearchIn={toggleSearchIn}
                includesSpecies={includesSpecies}
                taxNodes={taxNodes}
                onTaxNodesChange={handleTaxNodesChange}
                activeFilters={activeFilters}
                onActiveFiltersChange={setActiveFilters}
                onAttrsSearchChange={handleAttrsSearchChange}
                hasActiveFilters={taxNodes.length > 0 || urlAttrs.length > 0}
                onClearFilters={() => {
                  setActiveFilters([]);
                  navigate({
                    to: ROUTE,
                    search: (p) => ({ q: p.q, searchIn: p.searchIn ?? "species", page: 1 }),
                  });
                }}
              />
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

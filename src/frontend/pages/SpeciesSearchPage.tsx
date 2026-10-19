import { createRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import { useSearchSpecies } from "../features/species/hooks/useSearchSpecies";
import { useSearchSpecimens } from "../features/specimens/hooks/useSearchSpecimens";
import { useAttributeTemplates } from "../features/species/hooks/useAttributeTemplates";
import { SearchFiltersPanel } from "../features/search/components/SearchFiltersPanel";
import {
  SpeciesResultsSection,
  SpecimenResultsSection,
} from "../features/search/components/SearchResultsSections";
import { type ActiveAttrFilter, type AttrOperator } from "../features/search/components/AttributeFilters";
import { mapUrlAttrsToActiveFilters } from "../features/search/utils/urlAttrs";
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

function getToggledSearchIn(
  current: SearchParams["searchIn"],
  type: "species" | "specimen",
): SearchParams["searchIn"] {
  if (current === type) return current;
  if (current === "both") return type === "species" ? "specimen" : "species";
  return "both";
}

function getSafeArray<T>(arr?: T[]): T[] {
  return arr || [];
}

function useSearchRouteParams() {
  const navigate = useNavigate();
  const search = speciesSearchRoute.useSearch();

  const q = search.q || "";
  const page = search.page || 1;
  const taxNodes = getSafeArray(search.taxNodes);
  const urlAttrs = getSafeArray(search.attrs);
  const searchIn = search.searchIn;

  const setSearch = useCallback(
    (patch: Partial<SearchParams>) => {
      navigate({
        to: ROUTE,
        search: (prev) => ({ ...prev, searchIn: prev.searchIn ?? "species", ...patch, page: 1 }),
      });
    },
    [navigate],
  );

  const toggleSearchIn = useCallback(
    (type: "species" | "specimen") => {
      const next = getToggledSearchIn(searchIn, type);
      if (next !== searchIn) setSearch({ searchIn: next });
    },
    [searchIn, setSearch],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      navigate({
        to: ROUTE,
        search: (p) => ({ ...p, searchIn: p.searchIn ?? "species", page: nextPage }),
      });
    },
    [navigate],
  );

  return { q, page, taxNodes, urlAttrs, searchIn, setSearch, toggleSearchIn, handlePageChange, navigate };
}

function useSearchInput(q: string, setSearch: (patch: Partial<SearchParams>) => void) {
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch({ q: value || undefined }), 300);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSearch({ q: inputValue || undefined });
    }
  };

  return { inputValue, handleInputChange, handleInputKeyDown };
}

function useActiveAttributeFilters(
  urlAttrs: NonNullable<SearchParams["attrs"]>,
  setSearch: (patch: Partial<SearchParams>) => void,
) {
  const [activeFilters, setActiveFilters] = useState<ActiveAttrFilter[]>([]);
  const attrDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitFromUrl = useRef(false);
  const { data: templates = [] } = useAttributeTemplates();

  useEffect(() => {
    if (didInitFromUrl.current || urlAttrs.length === 0 || templates.length === 0) return;
    didInitFromUrl.current = true;
    setActiveFilters(mapUrlAttrsToActiveFilters(urlAttrs, templates));
  }, [templates, urlAttrs]);

  const handleAttrsSearchChange = (
    searchAttrs: Array<{ templateId: number; valueInBaseUnit: number; operator: AttrOperator; displayUnit: string }>,
  ) => {
    if (attrDebounceRef.current) clearTimeout(attrDebounceRef.current);
    attrDebounceRef.current = setTimeout(() => {
      const formatted = searchAttrs.map((a) => ({
        tid: a.templateId,
        val: a.valueInBaseUnit,
        displayUnit: a.displayUnit,
        op: a.operator,
      }));
      setSearch({
        attrs: formatted.length > 0 ? formatted : undefined,
      });
    }, 250);
  };

  return { activeFilters, setActiveFilters, handleAttrsSearchChange };
}

function buildSearchArgs(
  q: string,
  page: number,
  taxNodes: number[],
  urlAttrs: NonNullable<SearchParams["attrs"]>,
) {
  const attrs = urlAttrs.map((a) => ({
    templateId: a.tid,
    valueInBaseUnit: a.val,
    operator: a.op as AttrOperator,
  }));
  return {
    q: q.length ? q : undefined,
    page,
    pageSize: PAGE_SIZE,
    taxNodes: taxNodes.length ? taxNodes : undefined,
    attrs: attrs.length ? attrs : undefined,
  };
}

function useSpeciesSearchResults(
  q: string,
  page: number,
  taxNodes: number[],
  urlAttrs: NonNullable<SearchParams["attrs"]>,
  searchIn: SearchParams["searchIn"],
) {
  const includesSpecies = searchIn !== "specimen";
  const includesSpecimen = searchIn !== "species";
  const searchArgs = useMemo(
    () => buildSearchArgs(q, page, taxNodes, urlAttrs),
    [q, page, taxNodes, urlAttrs],
  );

  const { data: speciesData, isLoading: speciesLoading } = useSearchSpecies(searchArgs);
  const { data: specimenData, isLoading: specimenLoading } = useSearchSpecimens(
    q,
    includesSpecimen,
  );

  return {
    speciesData,
    specimenData,
    isLoading: (includesSpecies && speciesLoading) || (includesSpecimen && specimenLoading),
    includesSpecies,
    includesSpecimen,
  };
}

function extractDataTotals(
  speciesData?: ReturnType<typeof useSearchSpecies>["data"],
  specimenData?: ReturnType<typeof useSearchSpecimens>["data"],
) {
  const speciesTotal = speciesData ? speciesData.total : 0;
  const specimensList = specimenData ? specimenData.specimens : [];
  return { speciesTotal, specimensList };
}

function useTaxNodesFilter(setSearch: (patch: Partial<SearchParams>) => void) {
  return useCallback(
    (ids: number[]) => {
      setSearch({ taxNodes: ids.length ? ids : undefined });
    },
    [setSearch],
  );
}

function useSearchFilterReset(
  navigate: ReturnType<typeof useNavigate>,
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveAttrFilter[]>>,
) {
  return useCallback(() => {
    setActiveFilters([]);
    navigate({
      to: ROUTE,
      search: (p) => ({ q: p.q, searchIn: p.searchIn ?? "species", page: 1 }),
    });
  }, [navigate, setActiveFilters]);
}

function computeSearchMetrics(
  speciesTotal: number,
  specimensList: NonNullable<ReturnType<typeof useSearchSpecimens>["data"]>["specimens"],
  taxNodesCount: number,
  attrsCount: number,
) {
  return {
    speciesTotal,
    totalPages: Math.ceil(speciesTotal / PAGE_SIZE),
    specimensList,
    activeFilterBadgeCount: taxNodesCount + attrsCount,
  };
}

function useSpeciesSearchState() {
  const routeParams = useSearchRouteParams();
  const { q, page, taxNodes, urlAttrs, searchIn, setSearch, navigate } = routeParams;
  const { inputValue, handleInputChange, handleInputKeyDown } = useSearchInput(q, setSearch);
  const { activeFilters, setActiveFilters, handleAttrsSearchChange } = useActiveAttributeFilters(
    urlAttrs,
    setSearch,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { speciesData, specimenData, isLoading, includesSpecies, includesSpecimen } =
    useSpeciesSearchResults(q, page, taxNodes, urlAttrs, searchIn);

  const { speciesTotal, specimensList } = extractDataTotals(speciesData, specimenData);
  const metrics = computeSearchMetrics(
    speciesTotal,
    specimensList,
    taxNodes.length,
    urlAttrs.length,
  );

  const handleTaxNodesChange = useTaxNodesFilter(setSearch);
  const handleClearFilters = useSearchFilterReset(navigate, setActiveFilters);

  return {
    ...routeParams,
    ...metrics,
    activeFilters,
    setActiveFilters,
    inputValue,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    includesSpecies,
    includesSpecimen,
    speciesData,
    isLoading,
    handleInputChange,
    handleInputKeyDown,
    handleTaxNodesChange,
    handleAttrsSearchChange,
    handleClearFilters,
  };
}

function SpeciesSearchPage() {
  const s = useSpeciesSearchState();

  return (
    <PageShell className="bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 md:py-8 tv:max-w-screen-2xl tv:px-10">
        {/* Search input + mobile filters toggle */}
        <div className="mb-4 flex gap-3 md:mb-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={s.inputValue}
              onChange={(e) => s.handleInputChange(e.target.value)}
              onKeyDown={s.handleInputKeyDown}
              placeholder="Buscar espécie ou espécime..."
              className="pl-9"
            />
          </div>
          <button
            onClick={() => s.setMobileFiltersOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {s.activeFilterBadgeCount > 0 && (
              <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">
                {s.activeFilterBadgeCount}
              </span>
            )}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", s.mobileFiltersOpen && "rotate-180")} />
          </button>
        </div>

        {s.q && (
          <h2 className="mb-6 text-lg text-neutral-700 md:text-xl">
            Buscando por <strong className="text-neutral-900">"{s.q}"</strong>
          </h2>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 tv:gap-12">
          {/* Results */}
          <div className="order-2 min-w-0 flex-1 lg:order-1">
            {s.isLoading ? (
              <p className="text-sm text-neutral-400">Carregando...</p>
            ) : (
              <>
                {s.includesSpecies && (
                  <SpeciesResultsSection
                    searchIn={s.searchIn}
                    speciesTotal={s.speciesTotal}
                    species={s.speciesData?.species}
                    q={s.q}
                    page={s.page}
                    totalPages={s.totalPages}
                    onPageChange={s.handlePageChange}
                  />
                )}
                {s.includesSpecimen && (
                  <SpecimenResultsSection
                    searchIn={s.searchIn}
                    specimensList={s.specimensList}
                    q={s.q}
                  />
                )}
              </>
            )}
          </div>

          {/* Filters panel */}
          <aside
            className={cn(
              "order-1 lg:order-2 lg:block lg:w-72 lg:shrink-0 tv:w-80",
              s.mobileFiltersOpen ? "block" : "hidden",
            )}
          >
            <div className="rounded-lg border border-neutral-200 p-4 lg:border-0 lg:p-0">
              <SearchFiltersPanel
                searchIn={s.searchIn}
                onToggleSearchIn={s.toggleSearchIn}
                includesSpecies={s.includesSpecies}
                taxNodes={s.taxNodes}
                onTaxNodesChange={s.handleTaxNodesChange}
                activeFilters={s.activeFilters}
                onActiveFiltersChange={s.setActiveFilters}
                onAttrsSearchChange={s.handleAttrsSearchChange}
                hasActiveFilters={s.activeFilterBadgeCount > 0}
                onClearFilters={s.handleClearFilters}
              />
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}


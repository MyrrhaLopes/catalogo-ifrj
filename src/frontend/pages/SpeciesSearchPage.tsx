import { createRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { rootRoute } from "../rootRoute";
import { CatalogHeader } from "../components/CatalogHeader";
import { useSearchSpecies } from "../features/species/hooks/useSearchSpecies";
import { SpeciesSearchResultCard } from "../features/search/components/SpeciesSearchResultCard";
import { TaxonomyFilters } from "../features/search/components/TaxonomyFilters";
import {
  AttributeFilters,
  type ActiveAttrFilter,
} from "../features/search/components/AttributeFilters";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";

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
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const speciesSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/species/search",
  validateSearch: (search: Record<string, unknown>): SearchParams => searchParamsSchema.parse(search),
  component: SpeciesSearchPage,
});

const PAGE_SIZE = 20;

function SpeciesSearchPage() {
  const navigate = useNavigate();
  const search = speciesSearchRoute.useSearch();

  const q = search.q ?? "";
  const page = (search.page ?? 1) as number;
  const taxNodes = search.taxNodes ?? [];
  const urlAttrs = search.attrs ?? [];

  // Local attribute filter state (display values + units)
  const [activeFilters, setActiveFilters] = useState<ActiveAttrFilter[]>([]);

  // Local search input state
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attrs = urlAttrs.map((a) => ({ templateId: a.tid, valueInBaseUnit: a.val }));

  const { data, isLoading } = useSearchSpecies({
    q: q || undefined,
    page,
    pageSize: PAGE_SIZE,
    taxNodes: taxNodes.length > 0 ? taxNodes : undefined,
    attrs: attrs.length > 0 ? attrs : undefined,
  });

  const setSearch = useCallback(
    (patch: Partial<z.infer<typeof searchParamsSchema>>) => {
      navigate({
        to: "/species/search",
        search: (prev) => ({ ...prev, ...patch, page: 1 }),
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
      to: "/species/search",
      search: (prev) => ({
        ...prev,
        page: 1,
        attrs:
          searchAttrs.length > 0
            ? searchAttrs.map((a) => ({ tid: a.templateId, val: a.valueInBaseUnit, displayUnit: "" }))
            : undefined,
      }),
    });
  }

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
            placeholder="Buscar espécie..."
            className="pl-9"
          />
        </div>

        {q && (
          <h2 className="mb-6 text-xl text-neutral-700">
            Buscando por{" "}
            <strong className="text-neutral-900">"{q}"</strong>
          </h2>
        )}

        <div className="flex gap-8">
          {/* Results */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <p className="text-sm text-neutral-400">Carregando...</p>
            ) : !data || data.species.length === 0 ? (
              <p className="text-sm text-neutral-400">
                {q ? `Nenhum resultado para "${q}".` : "Nenhuma espécie encontrada."}
              </p>
            ) : (
              <>
                <div className="mb-4 text-xs text-neutral-500">
                  {total} {total === 1 ? "resultado" : "resultados"}
                </div>
                <div className="space-y-3">
                  {data.species.map((s) => (
                    <SpeciesSearchResultCard key={s.id} species={s} query={q} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      className="rounded-md border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() =>
                        navigate({ to: "/species/search", search: (p) => ({ ...p, page: page - 1 }) })
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
                        navigate({ to: "/species/search", search: (p) => ({ ...p, page: page + 1 }) })
                      }
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filters panel */}
          <aside className="w-72 shrink-0">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800">Filtros</h3>
                {(taxNodes.length > 0 || urlAttrs.length > 0) && (
                  <button
                    className="text-xs text-neutral-400 hover:text-red-500"
                    onClick={() => {
                      setActiveFilters([]);
                      navigate({
                        to: "/species/search",
                        search: (p) => ({ q: p.q, page: 1 }),
                      });
                    }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="mb-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Níveis taxonômicos
                </p>
                <TaxonomyFilters
                  selectedIds={taxNodes}
                  onChange={handleTaxNodesChange}
                />
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Atributos
                </p>
                <AttributeFilters
                  filters={activeFilters}
                  onChange={setActiveFilters}
                  onSearchChange={handleAttrsSearchChange}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

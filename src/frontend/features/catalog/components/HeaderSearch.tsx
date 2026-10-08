import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/frontend/components/ui/input";
import { searchSpecies } from "@/frontend/features/species/species.api";

export function HeaderSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: quickResults } = useQuery({
    queryKey: ["quick-search", debouncedQuery],
    queryFn: () => searchSpecies({ q: debouncedQuery, pageSize: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  function handleChange(value: string) {
    setQuery(value);
    setIsOpen(value.length >= 2);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      navigate({ to: "/especies/buscar", search: { searchIn: "species", q: query.trim() } });
    }
    if (e.key === "Escape") setIsOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  }

  function goToSpecies(id: number) {
    setIsOpen(false);
    setQuery("");
    navigate({ to: "/especies/$id", params: { id: String(id) } });
  }

  const species = quickResults?.species ?? [];

  return (
    <div ref={containerRef} className="relative shrink-0" onBlur={handleBlur}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
      <Input
        type="search"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Pesquisar espécime"
        className="w-60 rounded-sm border-neutral-300 bg-white pl-9 text-sm focus-visible:ring-green-600"
      />

      {isOpen && species.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-neutral-200 bg-white shadow-xl">
          {species.map((s) => {
            const leaf = s.taxonomyPath.at(-1);
            const parent = s.taxonomyPath.at(-2);
            const name =
              leaf?.label === "Espécie" && parent
                ? `${parent.labelValue} ${leaf.labelValue}`
                : (leaf?.labelValue ?? "Espécie");
            const popular = s.popularNames[0]?.name;

            return (
              <button
                key={s.id}
                className="flex w-full flex-col px-4 py-3 text-left hover:bg-neutral-50"
                onMouseDown={() => goToSpecies(s.id)}
              >
                <span className="text-sm font-medium italic text-neutral-900">{name}</span>
                {popular && (
                  <span className="text-xs text-neutral-500">{popular}</span>
                )}
              </button>
            );
          })}
          <div className="border-t border-neutral-100 px-4 py-2">
            <button
              className="text-xs text-green-700 hover:underline"
              onMouseDown={() => {
                setIsOpen(false);
                navigate({ to: "/especies/buscar", search: { searchIn: "species", q: query } });
              }}
            >
              Ver todos os resultados para "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

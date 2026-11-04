import { useState } from "react";
import { Search } from "lucide-react";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";

type Props = {
  templates: AttributeTemplate[];
  onSelect: (template: AttributeTemplate) => void;
};

/**
 * Lista de templates disponíveis com busca por texto e scroll — conteúdo do
 * dropdown de "Adicionar atributo" em AttributeFilters.tsx.
 */
export function AttributeTemplateDropdown({ templates, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? templates.filter((t) => `${t.label} ${t.unit}`.toLowerCase().includes(normalizedQuery))
    : templates;

  return (
    <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg">
      <div className="relative border-b border-neutral-100 p-2">
        <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar atributo..."
          className="w-full rounded-md border border-neutral-200 py-1 pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-neutral-400">Nenhum atributo encontrado.</p>
        ) : (
          filtered.map((t) => (
            <button
              key={t.id}
              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50"
              onClick={() => onSelect(t)}
            >
              {t.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

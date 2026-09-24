import { Link } from "@tanstack/react-router";
import type { SpeciesSearchResult } from "@/frontend/features/species/species.api";
import { highlightTerms } from "../utils/highlight";

type Props = {
  species: SpeciesSearchResult;
  query?: string;
};

export function SpeciesSearchResultCard({ species, query }: Props) {
  const leaf = species.taxonomyPath.at(-1);
  const parentNode = species.taxonomyPath.at(-2);

  const scientificName =
    leaf?.label === "Espécie" && parentNode
      ? `${parentNode.labelValue} ${leaf.labelValue}`
      : (leaf?.labelValue ?? "Espécie");

  const popularName = species.popularNames[0]?.name;

  return (
    <Link
      to="/especies/$id"
      params={{ id: String(species.id) }}
      className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      {species.thumbnail ? (
        <img
          src={species.thumbnail}
          alt={scientificName}
          className="h-24 w-24 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-[#e8f2d0] text-xs text-neutral-400">
          Sem imagem
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-semibold italic text-neutral-900">
          {query ? (
            <span
              dangerouslySetInnerHTML={{ __html: highlightTerms(scientificName, query) }}
            />
          ) : (
            scientificName
          )}
        </p>
        {popularName && (
          <p className="text-sm text-neutral-500">
            {query ? (
              <span
                dangerouslySetInnerHTML={{ __html: highlightTerms(popularName, query) }}
              />
            ) : (
              popularName
            )}
          </p>
        )}
        {species.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
            {query ? (
              <span
                dangerouslySetInnerHTML={{ __html: highlightTerms(species.excerpt, query) }}
              />
            ) : (
              species.excerpt
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

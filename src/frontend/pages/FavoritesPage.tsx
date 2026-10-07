import { createRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { rootRoute } from "../rootRoute";
import { CatalogHeader } from "../components/CatalogHeader";
import { useGetFavorites } from "../features/favorite/hooks/useGetFavorites";
import { getSpeciesDetails } from "../features/species/species.api";
import type { SpeciesDetails } from "../features/species/species.api";
import useAuth from "../shared/hooks/useAuth";

export const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favoritos",
  component: FavoritesPage,
});

function FavoritesPage() {
  const { data: user } = useAuth();
  const { data: favoriteIds = [], isLoading: loadingIds } =
    useGetFavorites(user);

  const { data: species = [], isLoading: loadingSpecies } = useQuery({
    queryKey: ["favorites-details", favoriteIds],
    queryFn: () => Promise.all(favoriteIds.map((id) => getSpeciesDetails(id))),
    enabled: favoriteIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingIds || (favoriteIds.length > 0 && loadingSpecies);

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          Meus Favoritos
        </h1>

        {isLoading && (
          <p className="text-neutral-400 text-sm">Carregando...</p>
        )}

        {!isLoading && favoriteIds.length === 0 && (
          <p className="text-neutral-500">
            Você ainda não favoritou nenhuma espécie.
          </p>
        )}

        {!isLoading && species.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {species.map((s) => (
              <FavoriteCard key={s.id} species={s} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function FavoriteCard({ species }: { species: SpeciesDetails }) {
  const lastNode = species.taxonomyPath.at(-1);
  const secondLastNode = species.taxonomyPath.at(-2);
  const scientificName =
    lastNode?.label === "Espécie" && secondLastNode
      ? `${secondLastNode.labelValue} ${lastNode.labelValue}`
      : (lastNode?.labelValue ?? "Espécie");
  const popularName = species.popularNames[0]?.name;

  return (
    <li>
      <Link
        to="/especies/$id"
        params={{ id: String(species.id) }}
        className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
      >
        {species.thumbnailImage ? (
          <img
            src={species.thumbnailImage.url}
            alt={scientificName}
            className="h-16 w-16 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-neutral-100 shrink-0" />
        )}
        <div>
          <p className="font-semibold italic text-neutral-900 leading-tight">
            {scientificName}
          </p>
          {popularName && (
            <p className="text-sm text-neutral-500 mt-0.5">{popularName}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

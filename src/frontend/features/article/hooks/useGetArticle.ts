import { useQuery } from "@tanstack/react-query";
import { getArticleBySpecies } from "../article.api";

export function useGetArticle(speciesId: number) {
  return useQuery({
    queryKey: ["article", "species", speciesId],
    queryFn: () => getArticleBySpecies(speciesId),
    enabled: speciesId > 0,
  });
}

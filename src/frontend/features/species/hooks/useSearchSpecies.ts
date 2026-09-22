import { useQuery } from "@tanstack/react-query";
import { searchSpecies, type SearchParams } from "../species.api";

export function useSearchSpecies(params: SearchParams) {
  return useQuery({
    queryKey: ["species-search", params],
    queryFn: () => searchSpecies(params),
    placeholderData: (prev) => prev,
    enabled:
      !!params.q ||
      (params.taxNodes?.length ?? 0) > 0 ||
      (params.attrs?.length ?? 0) > 0 ||
      params.page !== undefined,
  });
}

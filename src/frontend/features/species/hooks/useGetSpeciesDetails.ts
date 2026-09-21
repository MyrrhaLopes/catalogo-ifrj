import { useQuery } from "@tanstack/react-query";
import { getSpeciesDetails } from "../species.api";

export function useGetSpeciesDetails(id: number) {
  return useQuery({
    queryKey: ["species", "details", id],
    queryFn: () => getSpeciesDetails(id),
    enabled: id > 0,
    retry: false,
    staleTime:'static'
  });
}

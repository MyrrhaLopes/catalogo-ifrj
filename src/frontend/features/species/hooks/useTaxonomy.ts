import { useQuery } from "@tanstack/react-query";
import { getTaxonomy } from "../species.api";

export function useTaxonomy() {
  return useQuery({
    queryKey: ["taxonomy"],
    queryFn: getTaxonomy,
    staleTime: Infinity,
  });
}

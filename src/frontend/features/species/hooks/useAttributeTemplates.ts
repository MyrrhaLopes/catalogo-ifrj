import { useQuery } from "@tanstack/react-query";
import { getAttributeTemplates } from "../species.api";

export function useAttributeTemplates() {
  return useQuery({
    queryKey: ["attribute-templates"],
    queryFn: getAttributeTemplates,
    staleTime: Infinity,
  });
}

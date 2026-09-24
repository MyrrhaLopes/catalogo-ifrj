import { useQuery } from "@tanstack/react-query";
import { searchSpecimens } from "../specimen.api";

export function useSearchSpecimens(q: string, enabled: boolean) {
  return useQuery({
    queryKey: ["specimens-search", q],
    queryFn: () => searchSpecimens(q),
    placeholderData: (prev) => prev,
    enabled: enabled && q.length > 0,
  });
}

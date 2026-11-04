import { useQuery } from "@tanstack/react-query";
import { searchSpecimens } from "../specimen.api";

export function useSearchSpecimens(
  q: string,
  enabled: boolean,
  exposicao: Array<"humida" | "seca"> = ["humida", "seca"],
) {
  // Com o filtro de exposição restrito a uma única opção, a busca de espécimes
  // deve valer mesmo sem termo de texto digitado.
  const exposicaoIsFiltered = exposicao.length > 0 && exposicao.length < 2;

  return useQuery({
    queryKey: ["specimens-search", q, exposicao],
    queryFn: () => searchSpecimens(q, exposicao),
    placeholderData: (prev) => prev,
    enabled: enabled && (q.length > 0 || exposicaoIsFiltered),
  });
}

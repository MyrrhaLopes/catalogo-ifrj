import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { searchSpecies } from "@/frontend/features/species/species.api";
import { createSpecies, deleteSpecies } from "../admin.api";

export function useSpeciesList() {
  return useQuery({
    queryKey: ["species", "list"],
    queryFn: () => searchSpecies({ page: 1, pageSize: 100 }).then((r) => r.species),
  });
}

export function useSpeciesSearch(q: string) {
  return useQuery({
    queryKey: ["species", "search", q],
    queryFn: () => searchSpecies({ q: q || undefined, page: 1, pageSize: 50 }).then((r) => r.species),
  });
}

export function useCreateSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (speciesRoot: number) => createSpecies(speciesRoot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
    },
  });
}

export function useDeleteSpecies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSpecies(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
    },
  });
}

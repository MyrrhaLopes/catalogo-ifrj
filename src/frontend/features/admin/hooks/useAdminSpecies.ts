import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpeciesList } from "@/frontend/features/species/species.api";
import { createSpecies, deleteSpecies } from "../admin.api";

export function useSpeciesList() {
  return useQuery({
    queryKey: ["species", "list"],
    queryFn: getSpeciesList,
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

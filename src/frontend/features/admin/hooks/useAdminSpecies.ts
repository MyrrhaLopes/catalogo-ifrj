import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { searchSpecies, setSpeciesThumbnail } from "@/frontend/features/species/species.api";
import { ApiError } from "@/frontend/shared/api/client";
import { createSpecies, deleteSpecies, updateSpeciesAttributes } from "../admin.api";

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
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao excluir espécie. Tente novamente.");
    },
  });
}

export function useSetSpeciesThumbnail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ speciesId, imageId }: { speciesId: number; imageId: number | null }) =>
      setSpeciesThumbnail(speciesId, imageId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["species"] });
      void queryClient.invalidateQueries({ queryKey: ["species", "details", variables.speciesId] });
    },
  });
}

export function useUpdateSpeciesAttributes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      speciesId,
      attributes,
    }: {
      speciesId: number;
      attributes: Array<{ templateId: number; value: string; sourceUrl?: string | null }>;
    }) => updateSpeciesAttributes(speciesId, attributes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["species"] });
    },
  });
}

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { searchSpecies, setSpeciesThumbnail } from "@/frontend/features/species/species.api";
import { ApiError } from "@/frontend/shared/api/client";
import { createSpecies, deleteSpecies, getSpeciesDeleteImpact, updateSpeciesAttributes } from "../admin.api";

export function useSpeciesList() {
  return useQuery({
    queryKey: ["species", "list"],
    queryFn: () => searchSpecies({ page: 1, pageSize: 100 }).then((r) => r.species),
  });
}

export const SPECIES_ADMIN_PAGE_SIZE = 20;

export function useSpeciesAdminList(page: number, q: string) {
  return useQuery({
    queryKey: ["species", "admin-list", page, q],
    queryFn: () => searchSpecies({ page, pageSize: SPECIES_ADMIN_PAGE_SIZE, q: q || undefined }),
    placeholderData: (prev) => prev,
  });
}

export function useSpeciesAdminTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  function setSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  const { data, isLoading, isError } = useSpeciesAdminList(page, deferredQuery);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / SPECIES_ADMIN_PAGE_SIZE)) : 1;

  return {
    page,
    setPage,
    query,
    setSearch,
    species: data?.species ?? [],
    totalPages,
    isLoading,
    isError,
  };
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

export function useSpeciesDeleteImpact(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["species", "delete-impact", id],
    queryFn: () => getSpeciesDeleteImpact(id),
    enabled,
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

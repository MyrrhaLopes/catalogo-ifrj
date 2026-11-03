import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/frontend/shared/api/client";
import {
  listSpecimens,
  listSpecimensPaginated,
  createSpecimen,
  updateSpecimen,
  deleteSpecimen,
} from "@/frontend/features/specimens/specimen.api";

export function useSpecimenList() {
  return useQuery({
    queryKey: ["specimens"],
    queryFn: () => listSpecimens().then((r) => r.specimens),
  });
}

export const SPECIMEN_ADMIN_PAGE_SIZE = 20;

export function useSpecimenAdminTable() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["specimens", "admin-list", page],
    queryFn: () => listSpecimensPaginated(page, SPECIMEN_ADMIN_PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / SPECIMEN_ADMIN_PAGE_SIZE)) : 1;

  return {
    page,
    setPage,
    specimens: data?.specimens ?? [],
    totalPages,
    isLoading,
    isError,
  };
}

export function useCreateSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; exposicao: "humida" | "seca"; lot?: number; shelf?: number }) =>
      createSpecimen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
    },
  });
}

export function useUpdateSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: {
        code?: string;
        exposicao?: "humida" | "seca";
        lot?: number | null;
        shelf?: number | null;
        speciesId?: number | null;
      };
    }) => updateSpecimen(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
      queryClient.invalidateQueries({ queryKey: ["species"] });
    },
  });
}

export function useDeleteSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSpecimen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
      queryClient.invalidateQueries({ queryKey: ["species"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao excluir espécime. Tente novamente.");
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listSpecimens,
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

export function useCreateSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; lot?: number; shelf?: number }) => createSpecimen(data),
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
      patch: { code?: string; lot?: number | null; shelf?: number | null; speciesId?: number | null };
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
    },
  });
}

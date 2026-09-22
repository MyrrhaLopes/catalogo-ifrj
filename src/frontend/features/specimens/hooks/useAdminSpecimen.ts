import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listSpecimens,
  createSpecimen,
  updateSpecimen,
  deleteSpecimen,
  linkSpecimenToSpecies,
  unlinkSpecimenFromSpecies,
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
      patch: { code?: string; lot?: number | null; shelf?: number | null };
    }) => updateSpecimen(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
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

export function useLinkSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ speciesId, specimenId }: { speciesId: number; specimenId: number }) =>
      linkSpecimenToSpecies(speciesId, specimenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
    },
  });
}

export function useUnlinkSpecimen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ speciesId, specimenId }: { speciesId: number; specimenId: number }) =>
      unlinkSpecimenFromSpecies(speciesId, specimenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
      queryClient.invalidateQueries({ queryKey: ["specimens"] });
    },
  });
}

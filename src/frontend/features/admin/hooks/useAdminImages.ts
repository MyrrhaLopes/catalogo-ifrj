import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllImages,
  getImagesBySpecies,
  createImage,
  updateImage,
  deleteImage,
} from "@/frontend/features/images/images.api";

export function useImagesList(speciesId?: number) {
  return useQuery({
    queryKey: ["images", speciesId ?? "all"],
    queryFn: () =>
      speciesId !== undefined ? getImagesBySpecies(speciesId) : getAllImages(),
  });
}

export function useCreateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      url: string;
      alt?: string;
      speciesId: number;
      type?: "online" | "acervo";
      source?: string;
      credit?: string;
      specimenId?: number;
    }) => createImage(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { url?: string; alt?: string | null };
    }) => updateImage(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteImage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

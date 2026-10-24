import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllImages,
  getImagesBySpecies,
  createImage,
  updateImage,
  deleteImage,
} from "@/frontend/features/images/images.api";
import { ApiError } from "@/frontend/shared/api/client";

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
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao enviar imagem. Tente novamente.");
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

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllImages,
  getAllImagesPaginated,
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

export const IMAGES_ADMIN_PAGE_SIZE = 20;

export function useImagesAdminTable() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["images", "admin-list", page],
    queryFn: () => getAllImagesPaginated(page, IMAGES_ADMIN_PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / IMAGES_ADMIN_PAGE_SIZE)) : 1;

  return {
    page,
    setPage,
    images: data?.images ?? [],
    totalPages,
    isLoading,
    isError,
  };
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
      void queryClient.invalidateQueries({ queryKey: ["species"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao excluir imagem. Tente novamente.");
    },
  });
}

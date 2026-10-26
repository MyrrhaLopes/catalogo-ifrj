import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAttributeTemplates } from "@/frontend/features/species/species.api";
import { ApiError } from "@/frontend/shared/api/client";
import {
  getDistinctUnits,
  createAttributeTemplate,
  deleteAttributeTemplate,
  getAttributeTemplateDeleteImpact,
  updateAttributeTemplate,
} from "../admin.api";

export function useAttributeTemplatesList() {
  return useQuery({
    queryKey: ["attribute-templates"],
    queryFn: getAttributeTemplates,
  });
}

export function useDistinctUnits() {
  return useQuery({
    queryKey: ["attribute-templates", "units"],
    queryFn: getDistinctUnits,
    staleTime: 30_000,
  });
}

export function useDistinctLabels() {
  const { data: templates = [] } = useAttributeTemplatesList();
  return [...new Set(templates.map((t) => t.label))].sort();
}

export function useCreateAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAttributeTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attribute-templates"] });
    },
  });
}

export function useAttributeTemplateDeleteImpact(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["attribute-templates", "delete-impact", id],
    queryFn: () => getAttributeTemplateDeleteImpact(id),
    enabled,
  });
}

export function useDeleteAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAttributeTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attribute-templates"] });
      void queryClient.invalidateQueries({ queryKey: ["species"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao excluir modelo de atributo. Tente novamente.");
    },
  });
}

export function useUpdateAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { label?: string; unit?: string } }) =>
      updateAttributeTemplate(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attribute-templates"] });
    },
  });
}

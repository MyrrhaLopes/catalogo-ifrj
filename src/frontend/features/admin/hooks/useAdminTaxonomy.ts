import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaxonomyNode, updateTaxonomyNodeParent, updateTaxonomyNodeLabel, deleteTaxonomyNode } from "../admin.api";

export function useCreateTaxonomyNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      label,
      labelValue,
      parentId,
    }: {
      label: string;
      labelValue: string;
      parentId: number | null;
    }) => createTaxonomyNode(label, labelValue, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
    },
  });
}

export function useUpdateTaxonomyNodeLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, label, labelValue }: { nodeId: number; label: string; labelValue: string }) =>
      updateTaxonomyNodeLabel(nodeId, label, labelValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
    },
  });
}

export function useDeleteTaxonomyNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: number) => deleteTaxonomyNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
    },
  });
}

export function useUpdateTaxonomyNodeParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, newParentId }: { nodeId: number; newParentId: number }) =>
      updateTaxonomyNodeParent(nodeId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
    },
  });
}

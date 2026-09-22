import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaxonomyNode, updateTaxonomyNodeParent } from "../admin.api";

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
      parentId: number;
    }) => createTaxonomyNode(label, labelValue, parentId),
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

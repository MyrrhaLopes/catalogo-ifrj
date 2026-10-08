import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCreateSpecies } from "./useAdminSpecies";
import { useTaxonomy } from "@/frontend/features/species/hooks/useTaxonomy";
import {
  createTaxonomyNode as apiCreateTaxonomyNode,
  updateTaxonomyNodeParent as apiUpdateTaxonomyNodeParent,
} from "../admin.api";
import type { DraftTaxonomyNode } from "../components/TaxonomyTree";

export type SelectedNode = {
  id: number;
  label: string;
  labelValue: string;
};

function topSortDrafts(drafts: DraftTaxonomyNode[]): DraftTaxonomyNode[] {
  const resolved = new Set<number>();
  const result: DraftTaxonomyNode[] = [];
  const remaining = [...drafts];
  while (remaining.length > 0) {
    const before = remaining.length;
    for (let i = remaining.length - 1; i >= 0; i--) {
      const n = remaining[i];
      const isRoot = n.parentId === n.tempId;
      const parentResolved = n.parentId > 0 || resolved.has(n.parentId);
      if (isRoot || parentResolved) {
        result.push(n);
        resolved.add(n.tempId);
        remaining.splice(i, 1);
      }
    }
    if (remaining.length === before) break;
  }
  return result;
}

export function useCreateSpeciesWithDraftTaxonomy() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSpecies = useCreateSpecies();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: realNodes = [] } = useTaxonomy();

  const isPending = isSubmitting || createSpecies.isPending;

  async function submit(selectedNode: SelectedNode, draftNodes: DraftTaxonomyNode[]) {
    setIsSubmitting(true);
    try {
      const sorted = topSortDrafts(draftNodes);
      const tempToReal = new Map<number, number>();

      for (const draft of sorted) {
        const isRoot = draft.parentId === draft.tempId;
        if (isRoot) {
          const tempParent = realNodes[0];
          if (!tempParent) throw new Error("Nenhum nó taxonômico real disponível como pai temporário");
          const created = await apiCreateTaxonomyNode(draft.label, draft.labelValue, tempParent.id);
          await apiUpdateTaxonomyNodeParent(created.id, created.id);
          tempToReal.set(draft.tempId, created.id);
        } else {
          const realParentId = draft.parentId > 0 ? draft.parentId : tempToReal.get(draft.parentId)!;
          const created = await apiCreateTaxonomyNode(draft.label, draft.labelValue, realParentId);
          tempToReal.set(draft.tempId, created.id);
        }
      }

      if (sorted.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
      }

      const speciesRootId = selectedNode.id > 0 ? selectedNode.id : tempToReal.get(selectedNode.id)!;
      const created = await createSpecies.mutateAsync(speciesRootId);

      router.navigate({ to: "/especies/$id", params: { id: String(created.id) } });
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isPending };
}

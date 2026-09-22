import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Loader2 } from "lucide-react";
import { TaxonomyTree, type DraftTaxonomyNode } from "./TaxonomyTree";
import { useCreateSpecies } from "../hooks/useAdminSpecies";
import { useTaxonomy } from "@/frontend/features/species/hooks/useTaxonomy";
import {
  createTaxonomyNode as apiCreateTaxonomyNode,
  updateTaxonomyNodeParent as apiUpdateTaxonomyNodeParent,
} from "../admin.api";

type CreateSpeciesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SelectedNode = {
  id: number;         // negative = draft tempId, positive = real node ID
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
    if (remaining.length === before) break; // cycle guard
  }
  return result;
}

export function CreateSpeciesModal({ open, onOpenChange }: CreateSpeciesModalProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [draftNodes, setDraftNodes] = useState<DraftTaxonomyNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSpecies = useCreateSpecies();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: realNodes = [] } = useTaxonomy();

  async function handleSubmit() {
    if (!selectedNode) return;
    setIsSubmitting(true);
    try {
      // 1. Create draft taxonomy nodes in topological order (parents before children)
      const sorted = topSortDrafts(draftNodes);
      const tempToReal = new Map<number, number>();

      for (const draft of sorted) {
        const isRoot = draft.parentId === draft.tempId;
        if (isRoot) {
          // Root nodes require a 2-step create: temp parent → patch to self
          const tempParent = realNodes[0];
          if (!tempParent) throw new Error("Nenhum nó taxonômico real disponível como pai temporário");
          const created = await apiCreateTaxonomyNode(draft.label, draft.labelValue, tempParent.id);
          await apiUpdateTaxonomyNodeParent(created.id, created.id);
          tempToReal.set(draft.tempId, created.id);
        } else {
          const realParentId =
            draft.parentId > 0 ? draft.parentId : tempToReal.get(draft.parentId)!;
          const created = await apiCreateTaxonomyNode(draft.label, draft.labelValue, realParentId);
          tempToReal.set(draft.tempId, created.id);
        }
      }

      // 2. Invalidate taxonomy cache so the new nodes are reflected globally
      if (sorted.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["taxonomy"] });
      }

      // 3. Resolve the selected node's real ID
      const speciesRootId =
        selectedNode.id > 0 ? selectedNode.id : tempToReal.get(selectedNode.id)!;

      // 4. Create the species and redirect to its page
      const created = await createSpecies.mutateAsync(speciesRootId);

      setSelectedNode(null);
      setDraftNodes([]);
      onOpenChange(false);
      router.navigate({ to: "/especies/$id", params: { id: String(created.id) } });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelectedNode(null);
      setDraftNodes([]);
    }
    onOpenChange(next);
  }

  const isPending = isSubmitting || createSpecies.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Criar nova espécie</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            Selecione o nó taxonômico que representa esta espécie. Use os botões{" "}
            <strong>+ inserir nível</strong> para adicionar categorias intermediárias na
            hierarquia caso necessário.
          </p>

          {/* key forces remount on open/close, discarding all draft state */}
          <TaxonomyTree
            key={open ? "open" : "closed"}
            variant="insert"
            selectedNodeId={selectedNode?.id}
            onSelect={setSelectedNode}
            onDraftNodesChange={setDraftNodes}
          />

          {selectedNode && (
            <p className="text-sm">
              Selecionado:{" "}
              <span className="font-medium">
                {selectedNode.label}: {selectedNode.labelValue}
              </span>
              {selectedNode.id > 0 && (
                <span className="text-muted-foreground ml-1">(ID #{selectedNode.id})</span>
              )}
              {selectedNode.id < 0 && (
                <span className="text-green-600 ml-1">(novo — ainda não salvo)</span>
              )}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedNode || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar espécie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

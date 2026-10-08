import { useState } from "react";
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
import { useCreateSpeciesWithDraftTaxonomy, type SelectedNode } from "../hooks/useCreateSpeciesWithDraftTaxonomy";

type CreateSpeciesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSpeciesModal({ open, onOpenChange }: CreateSpeciesModalProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [draftNodes, setDraftNodes] = useState<DraftTaxonomyNode[]>([]);

  const { submit, isPending } = useCreateSpeciesWithDraftTaxonomy();

  async function handleSubmit() {
    if (!selectedNode) return;
    await submit(selectedNode, draftNodes);
    setSelectedNode(null);
    setDraftNodes([]);
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelectedNode(null);
      setDraftNodes([]);
    }
    onOpenChange(next);
  }

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

          <TaxonomyTree
            key={open ? "open" : "closed"}
            variant="new"
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

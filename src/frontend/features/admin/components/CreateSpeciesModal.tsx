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
import { TaxonomyTree } from "./TaxonomyTree";
import { useCreateSpecies } from "../hooks/useAdminSpecies";
import type { TaxonomyNode } from "@/backend/http/features/taxonomy/taxonomy.schema";

type CreateSpeciesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSpeciesModal({ open, onOpenChange }: CreateSpeciesModalProps) {
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);
  const createSpecies = useCreateSpecies();

  async function handleSubmit() {
    if (!selectedNode) return;
    await createSpecies.mutateAsync(selectedNode.id);
    setSelectedNode(null);
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedNode(null);
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
            variant="select"
            selectedNodeId={selectedNode?.id}
            onSelect={setSelectedNode}
          />

          {selectedNode && (
            <p className="text-sm">
              Selecionado:{" "}
              <span className="font-medium">
                {selectedNode.label}: {selectedNode.labelValue}
              </span>
              <span className="text-muted-foreground ml-1">(ID #{selectedNode.id})</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedNode || createSpecies.isPending}>
            {createSpecies.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Criar espécie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

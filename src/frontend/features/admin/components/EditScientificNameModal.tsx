import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Loader2 } from "lucide-react";
import { getScientificName } from "@/frontend/shared/utils/taxonomy";
import { useUpdateSpeciesScientificName } from "../hooks/useAdminSpecies";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: SpeciesSearchResult | null;
};

export function EditScientificNameModal({ open, onOpenChange, species }: Props) {
  const updateMutation = useUpdateSpeciesScientificName();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open || !species) return;
    setValue(species.scientificNameOverride ?? "");
  }, [open, species]);

  if (!species) return null;

  const derivedName = getScientificName(species.taxonomyPath);
  const trimmed = value.trim();
  const isDirty = trimmed !== (species.scientificNameOverride ?? "");
  const canConfirm = !updateMutation.isPending && isDirty;

  function handleClose() {
    onOpenChange(false);
  }

  function handleConfirm() {
    if (!species) return;
    updateMutation.mutate(
      { speciesId: species.id, scientificName: trimmed || null },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nome científico</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={derivedName}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Deixe em branco para usar o nome derivado da taxonomia ({derivedName}).
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

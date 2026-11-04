import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  useCreateAttributeTemplate,
  useDistinctUnits,
  useDistinctLabels,
} from "../hooks/useAdminAttributeTemplates";
import { SearchableField } from "./SearchableField";
import { AttributeKindFields } from "./AttributeKindFields";
import type { AttributeTemplateKind } from "../admin.api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAttributeTemplateModal({ open, onOpenChange }: Props) {
  const [label, setLabel] = useState("");
  const [unit, setUnit] = useState("");
  const [kind, setKind] = useState<AttributeTemplateKind>("numeric");
  const [options, setOptions] = useState<string[]>([]);

  const { data: existingUnits = [] } = useDistinctUnits();
  const existingLabels = useDistinctLabels();
  const createMutation = useCreateAttributeTemplate();

  function handleClose() {
    setLabel("");
    setUnit("");
    setKind("numeric");
    setOptions([]);
    onOpenChange(false);
  }

  function handleSubmit() {
    if (!label.trim()) return;
    if (kind === "numeric" && !unit.trim()) return;
    if (kind === "categorical" && options.length === 0) return;
    createMutation.mutate(
      {
        label: label.trim(),
        unit: kind === "numeric" ? unit.trim() : undefined,
        kind,
        options: kind === "categorical" ? options : undefined,
      },
      { onSuccess: handleClose },
    );
  }

  const canSubmit =
    label.trim().length > 0 &&
    (kind === "categorical" || unit.trim().length > 0) &&
    (kind === "numeric" || options.length > 0) &&
    !createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar template de atributo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="create-attr-label">
              Label
            </label>
            <SearchableField
              id="create-attr-label"
              value={label}
              onChange={setLabel}
              onSelect={setLabel}
              options={existingLabels}
              placeholder="Ex: Comprimento máximo"
              autoFocus
            />
          </div>

          <AttributeKindFields kind={kind} onKindChange={setKind} options={options} onOptionsChange={setOptions} />

          {kind === "numeric" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="create-attr-unit">
                Unidade <span className="text-muted-foreground font-normal">(use o singular)</span>
              </label>
              <SearchableField
                id="create-attr-unit"
                value={unit}
                onChange={setUnit}
                onSelect={setUnit}
                options={existingUnits}
                placeholder="Ex: metro, centímetro, quilograma…"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

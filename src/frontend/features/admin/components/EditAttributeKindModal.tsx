import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUpdateAttributeTemplate } from "../hooks/useAdminAttributeTemplates";
import { AttributeKindFields } from "./AttributeKindFields";
import type { AttributeTemplateItem, AttributeTemplateKind } from "../admin.api";

type Props = {
  template: AttributeTemplateItem | null;
  onOpenChange: (open: boolean) => void;
};

export function EditAttributeKindModal({ template, onOpenChange }: Props) {
  const [kind, setKind] = useState<AttributeTemplateKind>("numeric");
  const [options, setOptions] = useState<string[]>([]);
  const updateMutation = useUpdateAttributeTemplate();

  useEffect(() => {
    if (template) {
      setKind(template.kind);
      setOptions(template.options ?? []);
    }
  }, [template]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit() {
    if (!template) return;
    if (kind === "categorical" && options.length === 0) return;
    updateMutation.mutate(
      { id: template.id, patch: { kind, options: kind === "categorical" ? options : [] } },
      { onSuccess: handleClose },
    );
  }

  const canSubmit = (kind === "numeric" || options.length > 0) && !updateMutation.isPending;

  return (
    <Dialog open={template !== null} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Tipo de <span className="italic">{template?.label}</span>
          </DialogTitle>
        </DialogHeader>

        <AttributeKindFields kind={kind} onKindChange={setKind} options={options} onOptionsChange={setOptions} />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

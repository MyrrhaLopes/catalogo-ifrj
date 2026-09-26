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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Loader2 } from "lucide-react";
import { cn } from "@/frontend/shared/utils";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import { useUpdateSpeciesAttributes } from "../hooks/useAdminSpecies";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: SpeciesSearchResult | null;
};

function getScientificName(taxonomyPath: SpeciesSearchResult["taxonomyPath"]): string {
  const last = taxonomyPath.at(-1);
  const secondLast = taxonomyPath.at(-2);
  if (last?.label === "Espécie" && secondLast) {
    return `${secondLast.labelValue} ${last.labelValue}`;
  }
  return last?.labelValue ?? `#${last?.id ?? "—"}`;
}

export function EditSpeciesAttributesModal({ open, onOpenChange, species }: Props) {
  const { data: templates = [], isLoading } = useAttributeTemplates();
  const updateMutation = useUpdateSpeciesAttributes();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [values, setValues] = useState<Map<number, string>>(new Map());
  const [sourceUrls, setSourceUrls] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (!open || !species) return;
    const initSelected = new Set<number>();
    const initValues = new Map<number, string>();
    const initSourceUrls = new Map<number, string>();
    for (const attr of species.attributes) {
      const template = templates.find((t) => t.label === attr.label);
      if (template) {
        initSelected.add(template.id);
        initValues.set(template.id, attr.value);
        if (attr.sourceUrl) initSourceUrls.set(template.id, attr.sourceUrl);
      }
    }
    setSelectedIds(initSelected);
    setValues(initValues);
    setSourceUrls(initSourceUrls);
  }, [open, species, templates]);

  function toggleRow(templateId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
        setValues((v) => {
          const nv = new Map(v);
          nv.delete(templateId);
          return nv;
        });
        setSourceUrls((s) => {
          const ns = new Map(s);
          ns.delete(templateId);
          return ns;
        });
      } else {
        next.add(templateId);
      }
      return next;
    });
  }

  function setValue(templateId: number, val: string) {
    setValues((prev) => new Map(prev).set(templateId, val));
  }

  function setSourceUrl(templateId: number, val: string) {
    setSourceUrls((prev) => {
      const next = new Map(prev);
      if (val.trim()) {
        next.set(templateId, val);
      } else {
        next.delete(templateId);
      }
      return next;
    });
  }

  function handleClose() {
    onOpenChange(false);
  }

  function handleConfirm() {
    if (!species) return;
    const attributes: Array<{ templateId: number; value: string; sourceUrl?: string | null }> = [];
    for (const id of selectedIds) {
      const val = values.get(id)?.trim();
      if (val) {
        const url = sourceUrls.get(id)?.trim() || null;
        attributes.push({ templateId: id, value: val, sourceUrl: url });
      }
    }
    updateMutation.mutate(
      { speciesId: species.id, attributes },
      { onSuccess: handleClose },
    );
  }

  const isDirty = (() => {
    if (!species) return false;
    const currentByLabel = new Map(
      species.attributes.map((a) => [a.label, { value: a.value, sourceUrl: a.sourceUrl ?? null }]),
    );
    const draftAttrs: Array<{ label: string; value: string; sourceUrl: string | null }> = [];
    for (const id of selectedIds) {
      const t = templates.find((tmpl) => tmpl.id === id);
      const val = values.get(id)?.trim();
      if (t && val) {
        draftAttrs.push({ label: t.label, value: val, sourceUrl: sourceUrls.get(id)?.trim() || null });
      }
    }
    if (draftAttrs.length !== currentByLabel.size) return true;
    for (const { label, value, sourceUrl } of draftAttrs) {
      const cur = currentByLabel.get(label);
      if (!cur || cur.value !== value || cur.sourceUrl !== sourceUrl) return true;
    }
    return false;
  })();

  const canConfirm =
    !updateMutation.isPending &&
    isDirty &&
    [...selectedIds].every((id) => (values.get(id)?.trim() ?? "").length > 0);

  const scientificName = species ? getScientificName(species.taxonomyPath) : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>
            Atributos de{" "}
            <span className="italic">{scientificName || `espécie #${species?.id}`}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Label</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fonte (URL)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhum template cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((t) => {
                  const isSelected = selectedIds.has(t.id);
                  return (
                    <TableRow
                      key={t.id}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/10 ring-1 ring-inset ring-primary",
                      )}
                      onClick={() => toggleRow(t.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div
                          className={cn(
                            "h-4 w-4 rounded border shrink-0 cursor-pointer",
                            isSelected ? "bg-primary border-primary" : "border-input",
                          )}
                          onClick={() => toggleRow(t.id)}
                        />
                      </TableCell>
                      <TableCell>{t.label}</TableCell>
                      <TableCell>{t.unit}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isSelected ? (
                          <Input
                            className="h-7 w-32 text-sm"
                            placeholder="Ex: 0.30"
                            value={values.get(t.id) ?? ""}
                            onChange={(e) => setValue(t.id, e.target.value)}
                            autoFocus={false}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isSelected ? (
                          <Input
                            className="h-7 w-48 text-sm"
                            placeholder="https://..."
                            value={sourceUrls.get(t.id) ?? ""}
                            onChange={(e) => setSourceUrl(t.id, e.target.value)}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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

import { useState, useDeferredValue } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { Loader2, X } from "lucide-react";
import { useSpeciesSearch } from "../hooks/useAdminSpecies";
import { useUpdateSpecimen } from "../hooks/useAdminSpecimen";
import { cn } from "@/frontend/shared/utils";
import type { Specimen } from "@/frontend/features/specimens/specimen.api";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function getScientificName(taxonomyPath: SpeciesSearchResult["taxonomyPath"]): string {
  const last = taxonomyPath.at(-1);
  const secondLast = taxonomyPath.at(-2);
  if (last?.label === "Espécie" && secondLast) {
    return `${secondLast.labelValue} ${last.labelValue}`;
  }
  return last?.labelValue ?? "—";
}

function buildTaxonomyBreadcrumb(taxonomyPath: SpeciesSearchResult["taxonomyPath"]): string {
  return taxonomyPath.map((n) => n.labelValue).join(" > ") || "—";
}

// ────────────────────────────────────────────────────────────────────
// Currently-linked species chip
// ────────────────────────────────────────────────────────────────────

function LinkedChip({
  species,
  onRemove,
  isPending,
}: {
  species: SpeciesSearchResult;
  onRemove: () => void;
  isPending: boolean;
}) {
  const navigate = useNavigate();
  const scientificName = getScientificName(species.taxonomyPath);

  return (
    <span className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm bg-primary/10 border-primary/30">
      <button
        className="hover:underline text-left"
        onClick={() =>
          void navigate({
            to: "/admin",
            search: (prev) => ({
              ...prev,
              section: "species" as const,
              selectedSpeciesId: species.id,
            }),
          })
        }
      >
        <span className="font-medium">#{species.id}</span>
        {scientificName !== "—" && (
          <span className="ml-1 italic text-muted-foreground">{scientificName}</span>
        )}
      </button>
      <button
        className="text-muted-foreground hover:text-destructive"
        title="Remover vínculo"
        onClick={onRemove}
        disabled={isPending}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal
// ────────────────────────────────────────────────────────────────────

type SelectSpeciesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specimen: Specimen;
};

export function SelectSpeciesModal({ open, onOpenChange, specimen }: SelectSpeciesModalProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedId, setSelectedId] = useState<number | null>(specimen.linkedSpeciesId);

  const { data: species = [], isLoading } = useSpeciesSearch(deferredQuery);
  const updateMutation = useUpdateSpecimen();

  const currentSpecies = specimen.linkedSpeciesId != null
    ? (species.find((s) => s.id === specimen.linkedSpeciesId) ?? null)
    : null;

  function handleRemoveLink() {
    updateMutation.mutate(
      { id: specimen.id, patch: { speciesId: null } },
      { onSuccess: () => { setSelectedId(null); } },
    );
  }

  function handleSave() {
    updateMutation.mutate(
      { id: specimen.id, patch: { speciesId: selectedId } },
      { onSuccess: () => { onOpenChange(false); } },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Selecionar espécies</DialogTitle>
        </DialogHeader>

        {/* Currently linked */}
        {specimen.linkedSpeciesId != null && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Espécie vinculada</span>
            {currentSpecies ? (
              <LinkedChip
                species={currentSpecies}
                onRemove={handleRemoveLink}
                isPending={updateMutation.isPending}
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-sm bg-primary/10 border-primary/30">
                <span className="font-medium">#{specimen.linkedSpeciesId}</span>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleRemoveLink}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Search */}
        <Input
          placeholder="Buscar por nome científico, nome popular…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {/* Species table */}
        <div className="rounded-md border overflow-auto max-h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-12" />
                <TableHead>Nome científico</TableHead>
                <TableHead>Taxonomia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : species.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Nenhuma espécie encontrada
                  </TableCell>
                </TableRow>
              ) : (
                species.map((sp) => {
                  const isSelected = sp.id === selectedId;
                  return (
                    <TableRow
                      key={sp.id}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/10 ring-1 ring-inset ring-primary",
                      )}
                      onClick={() => setSelectedId(isSelected ? null : sp.id)}
                    >
                      <TableCell>
                        <div
                          className={cn(
                            "h-4 w-4 rounded border shrink-0",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-input",
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {sp.thumbnail ? (
                          <img src={sp.thumbnail} alt="" className="h-8 w-8 object-cover rounded" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                            —
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="italic text-sm">
                          {getScientificName(sp.taxonomyPath)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-xs text-muted-foreground max-w-[200px] truncate block"
                          title={buildTaxonomyBreadcrumb(sp.taxonomyPath)}
                        >
                          {buildTaxonomyBreadcrumb(sp.taxonomyPath)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || selectedId === specimen.linkedSpeciesId}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Button } from "@/frontend/components/ui/button";
import { Info, Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useAttributeTemplatesAdminTable,
  useDeleteAttributeTemplate,
  useAttributeTemplateDeleteImpact,
  useUpdateAttributeTemplate,
  useDistinctUnits,
  useDistinctLabels,
} from "../hooks/useAdminAttributeTemplates";
import { CreateAttributeTemplateModal } from "./CreateAttributeTemplateModal";
import { AttributeKindCell } from "./AttributeKindCell";
import { SearchableField } from "./SearchableField";
import { DeleteImpactDialog } from "./AdminTableShared";
import { AdminTablePagination } from "./AdminTablePagination";
import { AdminSearchInput } from "./AdminSearchInput";

// ────────────────────────────────────────────────────────────────────
// Inline editable cell with search
// ────────────────────────────────────────────────────────────────────

type InlineSearchableCellProps = {
  templateId: number;
  field: "label" | "unit";
  value: string;
  options: string[];
};

function InlineSearchableCell({ templateId, field, value, options }: InlineSearchableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const updateMutation = useUpdateAttributeTemplate();

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === value) return;
    updateMutation.mutate({ id: templateId, patch: { [field]: trimmed } });
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <span
        className="group flex items-center justify-between gap-2 cursor-pointer rounded border border-input px-2 py-0.5 text-sm hover:bg-muted transition-colors"
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span className="truncate">{value}</span>
        <Pencil className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    );
  }

  return (
    <div
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          cancel();
        }
      }}
    >
      <SearchableField
        value={draft}
        onChange={setDraft}
        onSelect={(val) => {
          setEditing(false);
          updateMutation.mutate({ id: templateId, patch: { [field]: val.trim() } });
        }}
        options={options}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { e.preventDefault(); cancel(); }
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Misc cells
// ────────────────────────────────────────────────────────────────────

function LockedCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Lock className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

function DeleteTemplateCell({ id, label }: { id: number; label: string }) {
  const [warningOpen, setWarningOpen] = useState(false);
  const deleteMutation = useDeleteAttributeTemplate();
  const { data: impact, isFetching } = useAttributeTemplateDeleteImpact(id, warningOpen);

  function handleConfirm() {
    deleteMutation.mutate(id, { onSuccess: () => setWarningOpen(false) });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/40 hover:bg-red-500 hover:text-white hover:border-red-500"
        onClick={() => setWarningOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Excluir
      </Button>
      <DeleteImpactDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        title={`Excluir o template "${label}"?`}
        items={impact && impact.usageCount > 0 ? [`Remover esse atributo de ${impact.usageCount} espécie(s)`] : []}
        isLoadingImpact={isFetching}
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main table
// ────────────────────────────────────────────────────────────────────

export function AttributeTemplatesTable() {
  const { templates, isLoading, isError, page, setPage, query, setSearch, totalPages } =
    useAttributeTemplatesAdminTable();
  const { data: existingUnits = [] } = useDistinctUnits();
  const existingLabels = useDistinctLabels();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Templates de atributos</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Criar template
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Escreva os nomes de unidade no <strong>singular</strong> — ex:{" "}
          <em>metro</em>, <em>centímetro</em>, <em>quilograma</em>. Clique em qualquer célula de
          label ou unidade para editá-la diretamente.
        </span>
      </div>

      <AdminSearchInput value={query} onChange={setSearch} placeholder="Buscar template…" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="w-40">Unidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Carregando templates…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive py-8">
                  Erro ao carregar templates.
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {query ? "Nenhum template encontrado para essa busca" : "Nenhum template cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <LockedCell>#{t.id}</LockedCell>
                  </TableCell>
                  <TableCell>
                    <InlineSearchableCell
                      templateId={t.id}
                      field="label"
                      value={t.label}
                      options={existingLabels}
                    />
                  </TableCell>
                  <TableCell className="w-40">
                    {t.kind === "categorical" ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      <InlineSearchableCell
                        templateId={t.id}
                        field="unit"
                        value={t.unit}
                        options={existingUnits}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <AttributeKindCell template={t} />
                  </TableCell>
                  <TableCell>
                    <DeleteTemplateCell id={t.id} label={t.label} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <CreateAttributeTemplateModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

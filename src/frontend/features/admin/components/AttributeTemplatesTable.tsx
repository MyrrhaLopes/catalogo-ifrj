import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/frontend/components/ui/alert-dialog";
import { Button } from "@/frontend/components/ui/button";
import { Info, Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useAttributeTemplatesList,
  useDeleteAttributeTemplate,
  useUpdateAttributeTemplate,
  useDistinctUnits,
  useDistinctLabels,
} from "../hooks/useAdminAttributeTemplates";
import { CreateAttributeTemplateModal } from "./CreateAttributeTemplateModal";
import { SearchableField } from "./SearchableField";

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
  const deleteMutation = useDeleteAttributeTemplate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleDelete() {
    setErrorMsg(null);
    deleteMutation.mutate(id, {
      onError: (err) => setErrorMsg(err instanceof Error ? err.message : "Erro ao excluir"),
    });
  }

  return (
    <AlertDialog onOpenChange={() => setErrorMsg(null)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/40 hover:bg-red-500 hover:text-white hover:border-red-500"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir template</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o template <strong>"{label}"</strong>? Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMsg && <p className="text-sm text-destructive px-1">{errorMsg}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main table
// ────────────────────────────────────────────────────────────────────

export function AttributeTemplatesTable() {
  const { data: templates = [], isLoading, isError } = useAttributeTemplatesList();
  const { data: existingUnits = [] } = useDistinctUnits();
  const existingLabels = useDistinctLabels();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando templates…
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-sm p-4">Erro ao carregar templates.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="w-40">Unidade</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum template cadastrado
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
                    <InlineSearchableCell
                      templateId={t.id}
                      field="unit"
                      value={t.unit}
                      options={existingUnits}
                    />
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

      <CreateAttributeTemplateModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

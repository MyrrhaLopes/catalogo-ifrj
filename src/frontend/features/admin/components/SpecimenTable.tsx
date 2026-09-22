import { useState, useRef } from "react";
import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
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
import { Input } from "@/frontend/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { useSpecimenList, useUpdateSpecimen, useDeleteSpecimen } from "../hooks/useAdminSpecimen";
import type { Specimen } from "@/frontend/features/specimens/specimen.api";

// ────────────────────────────────────────────────────────────────────
// Inline editable cell
// ────────────────────────────────────────────────────────────────────

type EditableCellProps = {
  specimenId: number;
  field: "code" | "lot" | "shelf";
  value: string | number | null;
  type?: "text" | "number";
};

function EditableCell({ specimenId, field, value, type = "text" }: EditableCellProps) {
  const updateMutation = useUpdateSpecimen();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(value != null ? String(value) : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    const raw = draft.trim();

    if (type === "number") {
      const parsed = raw === "" ? null : Number(raw);
      if (parsed !== null && !Number.isInteger(parsed)) return;
      updateMutation.mutate({ id: specimenId, patch: { [field]: parsed } });
    } else {
      if (raw === "" || raw === String(value)) return;
      updateMutation.mutate({ id: specimenId, patch: { [field]: raw } });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="h-7 w-full px-1 text-sm"
      />
    );
  }

  return (
    <span
      className="block cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
      onClick={startEdit}
      title="Clique para editar"
    >
      {value != null ? String(value) : <span className="text-muted-foreground">—</span>}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// Delete cell
// ────────────────────────────────────────────────────────────────────

function DeleteCell({ specimen }: { specimen: Specimen }) {
  const deleteMutation = useDeleteSpecimen();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir espécime</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o espécime{" "}
            <strong>{specimen.code}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(specimen.id)}
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
// Table definition
// ────────────────────────────────────────────────────────────────────

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Specimen>();

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => <span className="text-muted-foreground">#{ctx.getValue()}</span>,
  }),
  columnHelper.display({
    id: "code",
    header: "Código",
    cell: (ctx) => (
      <EditableCell
        specimenId={ctx.row.original.id}
        field="code"
        value={ctx.row.original.code}
        type="text"
      />
    ),
  }),
  columnHelper.display({
    id: "lot",
    header: "Lote",
    cell: (ctx) => (
      <EditableCell
        specimenId={ctx.row.original.id}
        field="lot"
        value={ctx.row.original.lot}
        type="number"
      />
    ),
  }),
  columnHelper.display({
    id: "shelf",
    header: "Prateleira",
    cell: (ctx) => (
      <EditableCell
        specimenId={ctx.row.original.id}
        field="shelf"
        value={ctx.row.original.shelf}
        type="number"
      />
    ),
  }),
  columnHelper.accessor("linkedSpeciesId", {
    header: "Espécie vinculada",
    cell: (ctx) => {
      const v = ctx.getValue();
      return v ? (
        <span className="text-sm">Espécie #{v}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Criado em",
    cell: (ctx) => {
      const v = ctx.getValue();
      if (!v) return <span className="text-muted-foreground">—</span>;
      return new Date(v).toLocaleDateString("pt-BR");
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (ctx) => <DeleteCell specimen={ctx.row.original} />,
  }),
]);

// ────────────────────────────────────────────────────────────────────
// Table component
// ────────────────────────────────────────────────────────────────────

export function SpecimenTable() {
  const { data: specimens = [], isLoading, isError } = useSpecimenList();

  const table = useTable({ features, data: specimens, columns });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando espécimes…
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-sm text-destructive">Erro ao carregar espécimes.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-muted-foreground"
              >
                Nenhum espécime cadastrado
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

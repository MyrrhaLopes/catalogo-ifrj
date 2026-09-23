import { useEffect, useRef, useState } from "react";
import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
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
import { Loader2, Lock, Pencil, Trash2 } from "lucide-react";
import { useSpecimenList, useUpdateSpecimen, useDeleteSpecimen } from "../hooks/useAdminSpecimen";
import { cn } from "@/frontend/shared/utils";
import type { Specimen } from "@/frontend/features/specimens/specimen.api";
import { SelectSpeciesModal } from "./SelectSpeciesModal";

// ────────────────────────────────────────────────────────────────────
// Inline editable cell
// ────────────────────────────────────────────────────────────────────

type EditableCellProps = {
  specimenId: number;
  field: "code" | "lot" | "shelf";
  value: string | number | null;
  type?: "text" | "number";
  className?: string;
};

function EditableCell({ specimenId, field, value, type = "text", className }: EditableCellProps) {
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
      const original = value != null ? Number(value) : null;
      if (parsed === original) return;
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
        className={cn("h-7 px-1 text-sm", className)}
      />
    );
  }

  return (
    <span
      className={cn("block cursor-pointer rounded border border-input px-1 py-0.5 transition-colors hover:bg-muted", className)}
      onClick={startEdit}
      title="Clique para editar"
    >
      {value != null ? String(value) : <span className="text-muted-foreground">—</span>}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// Read-only (locked) cell
// ────────────────────────────────────────────────────────────────────

function LockedCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Lock className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// Linked species cell
// ────────────────────────────────────────────────────────────────────

function LinkedSpeciesCell({ specimen }: { specimen: Specimen }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const sid = specimen.linkedSpeciesId;

  return (
    <>
      <div
        className="cursor-pointer rounded border border-input px-1.5 py-1 flex items-center gap-1 min-w-[120px] hover:bg-muted/40 transition-colors"
        onClick={() => setModalOpen(true)}
        title="Clique para alterar a espécie vinculada"
      >
        <span className="flex-1 text-xs">
          {sid != null ? (
            <button
              className="text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                void navigate({
                  to: "/admin",
                  search: (prev) => ({
                    ...prev,
                    section: "species" as const,
                    selectedSpeciesId: sid,
                  }),
                });
              }}
            >
              Espécie #{sid}
            </button>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
        <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
      </div>
      <SelectSpeciesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        specimen={specimen}
      />
    </>
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
    cell: (ctx) => (
      <LockedCell>
        <span>#{ctx.getValue()}</span>
      </LockedCell>
    ),
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
        className="w-28"
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
        className="w-16"
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
        className="w-16"
      />
    ),
  }),
  columnHelper.display({
    id: "linkedSpecies",
    header: "Espécie vinculada",
    cell: (ctx) => <LinkedSpeciesCell specimen={ctx.row.original} />,
  }),
  columnHelper.accessor("createdAt", {
    header: "Criado em",
    cell: (ctx) => {
      const v = ctx.getValue();
      if (!v) return <LockedCell>—</LockedCell>;
      return <LockedCell>{new Date(v).toLocaleDateString("pt-BR")}</LockedCell>;
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

type SpecimenTableProps = {
  selectedSpecimenId?: number;
};

export function SpecimenTable({ selectedSpecimenId }: SpecimenTableProps) {
  const { data: specimens = [], isLoading, isError } = useSpecimenList();
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSpecimenId != null && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedSpecimenId, specimens]);

  useEffect(() => {
    if (selectedSpecimenId == null) return;

    const clear = () =>
      void navigate({ to: "/admin", search: { section: "specimen" } });

    const timer = setTimeout(clear, 2000);

    function handleClick(e: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        clear();
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [selectedSpecimenId, navigate]);

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
    <div ref={tableRef} className="rounded-md border">
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
            table.getRowModel().rows.map((row) => {
              const isSelected = row.original.id === selectedSpecimenId;
              return (
                <TableRow
                  key={row.id}
                  ref={isSelected ? selectedRowRef : undefined}
                  className={cn(
                    isSelected && "bg-primary/10 ring-1 ring-inset ring-primary",
                  )}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

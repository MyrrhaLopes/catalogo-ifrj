import { useRef, useState } from "react";
import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/frontend/components/ui/input";
import { Pencil } from "lucide-react";
import { useSpecimenList, useUpdateSpecimen, useDeleteSpecimen } from "@/frontend/features/specimens/hooks/useAdminSpecimen";
import { cn } from "@/lib/utils";
import type { Specimen } from "@/frontend/features/specimens/specimen.api";
import { SelectSpeciesModal } from "./SelectSpeciesModal";
import { AdminDataTable, ConfirmDeleteButton, CreatedAtCell, LockedCell } from "./AdminTableShared";

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
// Exposição cell
// ────────────────────────────────────────────────────────────────────

function ExposicaoCell({ specimenId, value }: { specimenId: number; value: "humida" | "seca" }) {
  const updateMutation = useUpdateSpecimen();

  return (
    <select
      value={value}
      onChange={(e) =>
        updateMutation.mutate({
          id: specimenId,
          patch: { exposicao: e.target.value as "humida" | "seca" },
        })
      }
      className="h-7 w-24 rounded border border-input bg-transparent px-1 text-sm"
    >
      <option value="seca">Seca</option>
      <option value="humida">Húmida</option>
    </select>
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
      {modalOpen && (
        <SelectSpeciesModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          specimen={specimen}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Delete cell
// ────────────────────────────────────────────────────────────────────

function DeleteCell({ specimen }: { specimen: Specimen }) {
  const deleteMutation = useDeleteSpecimen();

  return (
    <ConfirmDeleteButton
      title="Excluir espécime"
      description={
        <>
          Tem certeza que deseja excluir o espécime{" "}
          <strong>
            {specimen.code} ({specimen.exposicao === "seca" ? "seca" : "húmida"})
          </strong>
          ? Esta ação não pode ser desfeita.
        </>
      }
      isPending={deleteMutation.isPending}
      onConfirm={() => deleteMutation.mutate(specimen.id)}
    />
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
    id: "exposicao",
    header: "Exposição",
    cell: (ctx) => (
      <ExposicaoCell specimenId={ctx.row.original.id} value={ctx.row.original.exposicao} />
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
    cell: (ctx) => <CreatedAtCell value={ctx.getValue()} />,
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
  const table = useTable({ features, data: specimens, columns });

  return (
    <AdminDataTable
      table={table}
      colCount={columns.length}
      emptyMessage="Nenhum espécime cadastrado"
      isLoading={isLoading}
      loadingMessage="Carregando espécimes…"
      isError={isError}
      errorMessage="Erro ao carregar espécimes."
      selectedId={selectedSpecimenId}
      clearSection="specimen"
      data={specimens}
    />
  );
}

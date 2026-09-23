import { useEffect, useRef } from "react";
import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { BookOpen, Loader2, Lock, Trash2, X } from "lucide-react";
import { useSpeciesList, useDeleteSpecies } from "../hooks/useAdminSpecies";
import { useUpdateSpecimen } from "../hooks/useAdminSpecimen";
import { cn } from "@/frontend/shared/utils";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, SpeciesSearchResult>();

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
// Cell sub-components (must be React components to use hooks)
// ────────────────────────────────────────────────────────────────────

function TaxonomyCell({ species }: { species: SpeciesSearchResult }) {
  const navigate = useNavigate();
  const path = buildTaxonomyBreadcrumb(species.taxonomyPath);

  return (
    <button
      className="text-left text-xs text-muted-foreground hover:text-foreground hover:underline max-w-[200px] truncate block"
      title={path}
      onClick={() =>
        void navigate({
          to: "/admin",
          search: (prev) => ({
            ...prev,
            section: "taxonomy" as const,
            selectedNodeId: species.speciesRoot,
          }),
        })
      }
    >
      {path}
    </button>
  );
}

function LockedCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Lock className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

function SpecimenChip({
  specimen,
}: {
  specimen: { id: number; code: string };
}) {
  const navigate = useNavigate();
  const updateMutation = useUpdateSpecimen();

  return (
    <span className="inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-xs bg-muted">
      <button
        className="hover:underline"
        onClick={() =>
          void navigate({
            to: "/admin",
            search: (prev) => ({
              ...prev,
              section: "specimen" as const,
              selectedSpecimenId: specimen.id,
            }),
          })
        }
      >
        {specimen.code}
      </button>
      <button
        className="text-muted-foreground hover:text-destructive ml-0.5"
        title="Desvincular"
        onClick={() => updateMutation.mutate({ id: specimen.id, patch: { speciesId: null } })}
        disabled={updateMutation.isPending}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SpecimensCell({ species }: { species: SpeciesSearchResult }) {
  if (species.specimens.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {species.specimens.map((sp) => (
        <SpecimenChip key={sp.id} specimen={sp} />
      ))}
    </div>
  );
}

function DeleteCell({ species }: { species: SpeciesSearchResult }) {
  const deleteMutation = useDeleteSpecies();

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
          <AlertDialogTitle>Excluir espécie</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a espécie <strong>#{species.id}</strong>? Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(species.id)}
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

const columns = columnHelper.columns([
  columnHelper.display({
    id: "thumbnail",
    header: "",
    cell: (ctx) => {
      const src = ctx.row.original.thumbnail;
      return src ? (
        <img src={src} alt="" className="h-10 w-10 object-cover rounded" />
      ) : (
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
          Sem img
        </div>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => <LockedCell>#{ctx.getValue()}</LockedCell>,
  }),
  columnHelper.display({
    id: "scientificName",
    header: "Nome científico",
    cell: (ctx) => (
      <span className="italic">{getScientificName(ctx.row.original.taxonomyPath)}</span>
    ),
  }),
  columnHelper.display({
    id: "taxonomyPath",
    header: "Taxonomia",
    cell: (ctx) => <TaxonomyCell species={ctx.row.original} />,
  }),
  columnHelper.display({
    id: "specimens",
    header: "Espécimes",
    cell: (ctx) => <SpecimensCell species={ctx.row.original} />,
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
    cell: (ctx) => (
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" asChild>
          <Link to="/especies/$id" params={{ id: String(ctx.row.original.id) }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Ver artigo
          </Link>
        </Button>
        <DeleteCell species={ctx.row.original} />
      </div>
    ),
  }),
]);

// ────────────────────────────────────────────────────────────────────
// Table component
// ────────────────────────────────────────────────────────────────────

type SpeciesTableProps = {
  selectedSpeciesId?: number;
};

export function SpeciesTable({ selectedSpeciesId }: SpeciesTableProps) {
  const { data: species = [], isLoading, isError } = useSpeciesList();
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSpeciesId != null && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedSpeciesId, species]);

  useEffect(() => {
    if (selectedSpeciesId == null) return;

    const clear = () =>
      void navigate({ to: "/admin", search: { section: "species" } });

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
  }, [selectedSpeciesId, navigate]);

  const table = useTable({
    features,
    data: species,
    columns,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando espécies…
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-sm p-4">Erro ao carregar espécies.</div>;
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
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                Nenhuma espécie cadastrada
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isSelected = row.original.id === selectedSpeciesId;
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

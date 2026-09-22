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
import { Loader2, Trash2 } from "lucide-react";
import { useSpeciesList, useDeleteSpecies } from "../hooks/useAdminSpecies";
import type { SpeciesBase } from "@/backend/http/features/species/species.schema";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, SpeciesBase>();

function DeleteCell({ species }: { species: SpeciesBase }) {
  const deleteMutation = useDeleteSpecies();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
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
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => ctx.getValue(),
  }),
  columnHelper.accessor("speciesRoot", {
    header: "Nó taxonômico",
    cell: (ctx) => (
      <span className="text-muted-foreground">#{ctx.getValue()}</span>
    ),
  }),
  columnHelper.accessor("specimen", {
    header: "Espécime",
    cell: (ctx) => {
      const v = ctx.getValue();
      return v ? <span>#{v}</span> : <span className="text-muted-foreground">—</span>;
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
    cell: (ctx) => <DeleteCell species={ctx.row.original} />,
  }),
]);

export function SpeciesTable() {
  const { data: species = [], isLoading, isError } = useSpeciesList();

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
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                Nenhuma espécie cadastrada
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

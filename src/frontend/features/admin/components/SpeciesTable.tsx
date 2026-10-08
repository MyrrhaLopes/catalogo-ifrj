import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { useSpeciesList } from "../hooks/useAdminSpecies";
import { cn } from "@/lib/utils";
import { columns, features } from "./SpeciesTableColumns";

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
                  className={cn(isSelected && "bg-primary/10 ring-1 ring-inset ring-primary")}
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

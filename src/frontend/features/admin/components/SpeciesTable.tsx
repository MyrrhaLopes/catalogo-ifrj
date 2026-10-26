import { useTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { useSpeciesAdminTable } from "../hooks/useAdminSpecies";
import { columns, features } from "./SpeciesTableColumns";
import { AdminDataTable } from "./AdminTableShared";
import { SpeciesTablePagination } from "./SpeciesTablePagination";

type SpeciesTableProps = {
  selectedSpeciesId?: number;
};

export function SpeciesTable({ selectedSpeciesId }: SpeciesTableProps) {
  const { species, isLoading, isError, page, setPage, query, setSearch, totalPages } =
    useSpeciesAdminTable();

  const table = useTable({
    features,
    data: species,
    columns,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar espécie…"
          className="pl-8"
        />
      </div>

      <AdminDataTable
        table={table}
        colCount={columns.length}
        emptyMessage={query ? "Nenhuma espécie encontrada para essa busca" : "Nenhuma espécie cadastrada"}
        isLoading={isLoading}
        loadingMessage="Carregando espécies…"
        isError={isError}
        errorMessage="Erro ao carregar espécies."
        selectedId={selectedSpeciesId}
        clearSection="species"
        data={species}
      />

      <SpeciesTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

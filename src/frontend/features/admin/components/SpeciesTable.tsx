import { useTable } from "@tanstack/react-table";
import { useSpeciesList } from "../hooks/useAdminSpecies";
import { columns, features } from "./SpeciesTableColumns";
import { AdminDataTable } from "./AdminTableShared";

type SpeciesTableProps = {
  selectedSpeciesId?: number;
};

export function SpeciesTable({ selectedSpeciesId }: SpeciesTableProps) {
  const { data: species = [], isLoading, isError } = useSpeciesList();

  const table = useTable({
    features,
    data: species,
    columns,
  });

  return (
    <AdminDataTable
      table={table}
      colCount={columns.length}
      emptyMessage="Nenhuma espécie cadastrada"
      isLoading={isLoading}
      loadingMessage="Carregando espécies…"
      isError={isError}
      errorMessage="Erro ao carregar espécies."
      selectedId={selectedSpeciesId}
      clearSection="species"
      data={species}
    />
  );
}

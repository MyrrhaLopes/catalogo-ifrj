import { Button } from "@/frontend/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SpeciesTablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function SpeciesTablePagination({ page, totalPages, onPageChange }: SpeciesTablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

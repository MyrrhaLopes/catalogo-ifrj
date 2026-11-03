import { tableFeatures, createColumnHelper } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/frontend/components/ui/button";
import { BookOpen } from "lucide-react";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";
import { CreatedAtCell, LockedCell } from "./AdminTableShared";
import {
  ThumbnailCell,
  ScientificNameCell,
  TaxonomyCell,
  SpecimensCell,
  AttributesEditCell,
  DeleteCell,
} from "./SpeciesTableCells";

export const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, SpeciesSearchResult>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "thumbnail",
    header: "",
    cell: (ctx) => <ThumbnailCell species={ctx.row.original} />,
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => <LockedCell>#{ctx.getValue()}</LockedCell>,
  }),
  columnHelper.display({
    id: "scientificName",
    header: "Nome científico",
    cell: (ctx) => <ScientificNameCell species={ctx.row.original} />,
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
  columnHelper.display({
    id: "attributes",
    header: "Atributos",
    cell: (ctx) => <AttributesEditCell species={ctx.row.original} />,
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: "Criado em",
    cell: (ctx) => <CreatedAtCell value={ctx.getValue()} />,
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

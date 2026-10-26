import { useState } from "react";
import { tableFeatures, createColumnHelper } from "@tanstack/react-table";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/frontend/components/ui/button";
import { BookOpen, ImageIcon, Pencil, Trash2, X } from "lucide-react";
import { useDeleteSpecies, useSpeciesDeleteImpact, useUpdateSpeciesAttributes, useSetSpeciesThumbnail } from "../hooks/useAdminSpecies";
import { useUpdateSpecimen } from "@/frontend/features/specimens/hooks/useAdminSpecimen";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";
import { EditSpeciesAttributesModal } from "./EditSpeciesAttributesModal";
import { ImagePickerModal } from "@/frontend/features/images/components/ImagePickerModal";
import type { GalleryImage } from "@/frontend/features/images/images.api";
import { getScientificName, buildTaxonomyBreadcrumb } from "@/frontend/shared/utils/taxonomy";
import { isRecentlyCreated } from "../utils/recentlyCreated";
import { CreatedAtCell, DeleteImpactDialog, LockedCell } from "./AdminTableShared";

export const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, SpeciesSearchResult>();

function ThumbnailCell({ species }: { species: SpeciesSearchResult }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const setThumbnail = useSetSpeciesThumbnail();

  function handleSelect(image: GalleryImage) {
    setThumbnail.mutate({ speciesId: species.id, imageId: image.id });
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="h-10 w-10 rounded overflow-hidden border border-input shrink-0">
        {species.thumbnail ? (
          <img src={species.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
      <button
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Alterar thumbnail"
        onClick={() => setPickerOpen(true)}
      >
        <Pencil className="h-3 w-3" />
      </button>
      {pickerOpen && (
        <ImagePickerModal
          speciesId={species.id}
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}

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

function SpecimenChip({ specimen }: { specimen: { id: number; code: string; exposicao: "humida" | "seca" } }) {
  const navigate = useNavigate();
  const updateMutation = useUpdateSpecimen();

  return (
    <span className="inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-xs bg-muted">
      <button
        className="text-primary hover:underline"
        title={specimen.exposicao === "seca" ? "Exposição seca" : "Exposição húmida"}
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
        <span className="text-muted-foreground"> ({specimen.exposicao === "seca" ? "S" : "H"})</span>
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

function AttributesEditCell({ species }: { species: SpeciesSearchResult }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: templates = [] } = useAttributeTemplates();
  const updateMutation = useUpdateSpeciesAttributes();

  function handleRemove(label: string, value: string) {
    const remaining = species.attributes
      .filter((a) => !(a.label === label && a.value === value))
      .flatMap((a) => {
        const tmpl = templates.find((t) => t.label === a.label);
        if (!tmpl) return [];
        return [{ templateId: tmpl.id, value: a.value }];
      });
    updateMutation.mutate({ speciesId: species.id, attributes: remaining });
  }

  return (
    <>
      <div
        className="cursor-pointer rounded border border-input px-1.5 py-1 flex items-start gap-1 min-w-[120px] hover:bg-muted/40 transition-colors"
        onClick={() => setModalOpen(true)}
        title="Clique para editar atributos"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {species.attributes.length === 0 ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : (
            species.attributes.map((a) => (
              <span
                key={`${a.label}-${a.value}`}
                className="inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-xs bg-muted"
              >
                <span title={`${a.label}: ${a.value} ${a.unit}`}>
                  {a.label}: {a.value} {a.unit}
                </span>
                <button
                  className="text-muted-foreground hover:text-destructive ml-0.5"
                  title="Remover atributo"
                  disabled={updateMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(a.label, a.value);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <Pencil className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      </div>

      {modalOpen && (
        <EditSpeciesAttributesModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          species={species}
        />
      )}
    </>
  );
}

function DeleteCell({ species }: { species: SpeciesSearchResult }) {
  const [warningOpen, setWarningOpen] = useState(false);
  const deleteMutation = useDeleteSpecies();
  const { data: impact, isFetching } = useSpeciesDeleteImpact(species.id, warningOpen);

  const items = impact
    ? [
        ...(impact.hasArticle ? ["Apagar o artigo desta espécie"] : []),
        ...(impact.attributesCount > 0 ? [`Apagar ${impact.attributesCount} atributo(s)`] : []),
        ...(impact.popularNamesCount > 0 ? [`Apagar ${impact.popularNamesCount} nome(s) popular(es)`] : []),
        ...(impact.imagesCount > 0 ? [`Desvincular ${impact.imagesCount} imagem(ns) do artigo`] : []),
        ...(impact.specimensCount > 0 ? [`Desvincular ${impact.specimensCount} espécime(s)`] : []),
      ]
    : [];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/40 hover:bg-red-500 hover:text-white hover:border-red-500"
        onClick={() => setWarningOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Excluir
      </Button>
      <DeleteImpactDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        title={`Excluir a espécie #${species.id}?`}
        items={items}
        isLoadingImpact={isFetching}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(species.id, { onSuccess: () => setWarningOpen(false) })}
      />
    </>
  );
}

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
    cell: (ctx) => (
      <span className="flex items-center gap-1.5">
        <span className="italic">{getScientificName(ctx.row.original.taxonomyPath)}</span>
        {isRecentlyCreated(ctx.row.original.createdAt) && (
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 text-[10px] font-medium px-1.5 py-0.5 dark:bg-green-900/40 dark:text-green-400">
            Novo
          </span>
        )}
      </span>
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

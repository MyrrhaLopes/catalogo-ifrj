import { useState } from "react";
import { tableFeatures, createColumnHelper } from "@tanstack/react-table";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { BookOpen, ImageIcon, Loader2, Lock, Pencil, Trash2, X } from "lucide-react";
import { useDeleteSpecies, useUpdateSpeciesAttributes, useSetSpeciesThumbnail } from "../hooks/useAdminSpecies";
import { useUpdateSpecimen } from "@/frontend/features/specimens/hooks/useAdminSpecimen";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import { cn } from "@/lib/utils";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";
import { EditSpeciesAttributesModal } from "./EditSpeciesAttributesModal";
import { ImagePickerModal } from "@/frontend/features/images/components/ImagePickerModal";
import type { GalleryImage } from "@/frontend/features/images/images.api";

export const features = tableFeatures({});
export const columnHelper = createColumnHelper<typeof features, SpeciesSearchResult>();

export function getScientificName(taxonomyPath: SpeciesSearchResult["taxonomyPath"]): string {
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
      <ImagePickerModal
        speciesId={species.id}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
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

function LockedCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Lock className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

function SpecimenChip({ specimen }: { specimen: { id: number; code: string } }) {
  const navigate = useNavigate();
  const updateMutation = useUpdateSpecimen();

  return (
    <span className="inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-xs bg-muted">
      <button
        className="text-primary hover:underline"
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

      <EditSpeciesAttributesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        species={species}
      />
    </>
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
  columnHelper.display({
    id: "attributes",
    header: "Atributos",
    cell: (ctx) => <AttributesEditCell species={ctx.row.original} />,
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

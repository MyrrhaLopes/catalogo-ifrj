import { ImageIcon, Loader2 } from "lucide-react";
import { SpeciesGroup, type ImageGroup } from "./SpeciesGroup";
import type { EnrichedImage, ThumbSize } from "../gallery.api";

const GRID_COLS: Record<ThumbSize, string> = {
  small: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 tv:grid-cols-8",
  medium: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 tv:grid-cols-7",
  large: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 tv:grid-cols-5",
};

function GalleryLoading() {
  return (
    <div className="flex items-center justify-center h-64 text-neutral-400">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Carregando galeria…
    </div>
  );
}

function GalleryError() {
  return (
    <div className="flex items-center justify-center h-64 text-destructive text-sm">
      Erro ao carregar as imagens.
    </div>
  );
}

function GalleryEmpty({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-400">
      <ImageIcon className="h-10 w-10" />
      <p className="text-sm">
        {hasActiveFilters
          ? "Nenhuma imagem encontrada para os filtros aplicados."
          : "Nenhuma imagem cadastrada."}
      </p>
    </div>
  );
}

type GalleryMainContentProps = {
  isLoading: boolean;
  isError: boolean;
  groups: ImageGroup[];
  hasActiveFilters: boolean;
  thumbSize: ThumbSize;
  expanded: Set<string>;
  onToggleGroup: (key: string) => void;
  onOpenViewer: (images: EnrichedImage[], index: number) => void;
};

export function GalleryMainContent({
  isLoading,
  isError,
  groups,
  hasActiveFilters,
  thumbSize,
  expanded,
  onToggleGroup,
  onOpenViewer,
}: GalleryMainContentProps) {
  if (isLoading) return <GalleryLoading />;
  if (isError) return <GalleryError />;
  if (groups.length === 0) return <GalleryEmpty hasActiveFilters={hasActiveFilters} />;
  return (
    <>
      {groups.map((group) => (
        <SpeciesGroup
          key={group.key}
          group={group}
          gridCols={GRID_COLS[thumbSize]}
          expanded={expanded.has(group.key)}
          onToggleExpand={() => onToggleGroup(group.key)}
          onOpenViewer={onOpenViewer}
        />
      ))}
    </>
  );
}

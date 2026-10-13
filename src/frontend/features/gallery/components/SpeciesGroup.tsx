import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { EnrichedImage } from "../gallery.api";
import { ImageCard } from "./ImageCard";

function buildGroupMeta(images: EnrichedImage[]): string {
  const first = images[0];
  if (!first) return "";
  const parts: string[] = [];
  if (first.popularName) parts.push(first.popularName);
  const family = first.taxonomyPath.find((n) => n.label === "Família")?.labelValue;
  if (family) parts.push(family);
  const specimenCode = images.find((i) => i.type === "acervo" && i.specimen)?.specimen?.code;
  if (specimenCode) parts.push(`exemplar ${specimenCode}`);
  return parts.join(" · ");
}

export type ImageGroup = {
  key: string;
  label: string;
  sublabel: string | null;
  speciesId: number | null;
  acervoCount: number;
  onlineCount: number;
  images: EnrichedImage[];
};

type Props = {
  group: ImageGroup;
  gridCols: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenViewer: (images: EnrichedImage[], index: number) => void;
};

const MAX_PREVIEW = 4;

export function SpeciesGroup({ group, gridCols, expanded, onToggleExpand, onOpenViewer }: Props) {
  const visibleImages =
    !expanded && group.images.length > MAX_PREVIEW + 1
      ? group.images.slice(0, MAX_PREVIEW)
      : group.images;
  const overflow = group.images.length - MAX_PREVIEW;
  const showOverflow = !expanded && overflow > 0 && group.images.length > MAX_PREVIEW + 1;

  const meta = group.sublabel ?? buildGroupMeta(group.images);

  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold italic text-neutral-900 sm:text-lg tv:text-xl">{group.label}</h2>
          {meta && <p className="text-xs text-neutral-500 mt-0.5 truncate tv:text-sm">{meta}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-neutral-500 tv:text-sm">
            {group.acervoCount > 0 && `${group.acervoCount} do acervo`}
            {group.acervoCount > 0 && group.onlineCount > 0 && " · "}
            {group.onlineCount > 0 && `${group.onlineCount} online`}
          </p>
          {group.speciesId != null && (
            <Link
              to="/especies/$id"
              params={{ id: String(group.speciesId) }}
              className="text-xs text-green-700 hover:underline inline-flex items-center gap-0.5 mt-0.5 tv:text-sm"
            >
              Ver artigo
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className={`grid ${gridCols} gap-2 tv:gap-3`}>
        {visibleImages.map((img, i) => (
          <ImageCard key={img.id} image={img} onClick={() => onOpenViewer(group.images, i)} />
        ))}
        {showOverflow && (
          <button
            onClick={onToggleExpand}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <span className="text-lg font-semibold">+{overflow}</span>
            <span className="text-xs">ver todas</span>
          </button>
        )}
        {expanded && (
          <button
            onClick={onToggleExpand}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors text-xs"
          >
            Ocultar
          </button>
        )}
      </div>
    </div>
  );
}

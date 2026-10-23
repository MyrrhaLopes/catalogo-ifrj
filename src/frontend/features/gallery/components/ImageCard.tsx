import { Camera, Globe, ImageIcon } from "lucide-react";
import type { EnrichedImage } from "../gallery.api";

type Props = {
  image: EnrichedImage;
  onClick: () => void;
};

export function ImageCard({ image, onClick }: Props) {
  const isAcervo = image.type === "acervo";
  const sourceLabel = isAcervo && image.specimen
    ? `${image.specimen.code} (${image.specimen.exposicao === "seca" ? "seca" : "húmida"})${image.specimen.shelf != null ? ` · Prat. ${image.specimen.shelf}` : ""}${image.specimen.lot != null ? ` · Lote ${image.specimen.lot}` : ""}`
    : image.source
      ? (() => { try { return new URL(image.source).hostname; } catch { return image.source; } })()
      : null;

  return (
    <button
      onClick={onClick}
      className="group text-left flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {image.url ? (
          <img
            src={image.url}
            alt={image.alt ?? ""}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-300">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <span
          className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tv:text-xs ${
            isAcervo
              ? "bg-green-700 text-white"
              : "bg-white/90 text-neutral-700 border border-neutral-300"
          }`}
        >
          {isAcervo ? <Camera className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
          {isAcervo ? "Acervo" : "Online"}
        </span>
      </div>

      {(image.alt || sourceLabel) && (
        <div className="px-2 py-1.5">
          {image.alt && (
            <p className="text-[11px] text-neutral-700 leading-snug line-clamp-2 tv:text-sm">{image.alt}</p>
          )}
          {sourceLabel && (
            <p className="text-[10px] text-neutral-400 mt-0.5 truncate tv:text-xs">{sourceLabel}</p>
          )}
        </div>
      )}
    </button>
  );
}

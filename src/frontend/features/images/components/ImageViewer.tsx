import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { useImageZoom } from "@/frontend/features/images/hooks/useImageZoom";
import { useImageViewerNavigation } from "@/frontend/features/images/hooks/useImageViewerNavigation";
import { ImageViewerDetails } from "@/frontend/features/images/components/ImageViewerDetails";
import { ImageViewerSlide } from "@/frontend/features/images/components/ImageViewerSlide";
import { ImageViewerThumbnailStrip } from "@/frontend/features/images/components/ImageViewerThumbnailStrip";

export type ViewerImage = {
  id: number;
  url: string;
  alt: string | null;
  type?: "online" | "acervo";
  source?: string | null;
  credit?: string | null;
  createdAt?: string;
  speciesId?: number | null;
  speciesName?: string;
  popularName?: string | null;
  taxonomyPath?: { label: string; labelValue: string }[];
  specimen?: { code: string; exposicao?: "humida" | "seca"; shelf: number | null; lot: number | null } | null;
  speciesThumbnail?: string | null;
};

type Props = {
  images: ViewerImage[];
  open: boolean;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  // kept for backward compat
  initialIndex?: number;
};

export function ImageViewer({ images, open, currentIndex, onClose, onNavigate }: Props) {
  const { data: user } = useAuth();
  const image = images[currentIndex];
  const { isZoomed, getTransformRefCallback, handleTransformed, resetAllZoom } = useImageZoom(image?.id);
  const { scrollRef, hasPrev, hasNext, handleScroll } = useImageViewerNavigation({
    open,
    imagesLength: images.length,
    currentIndex,
    navigationEnabled: !isZoomed,
    onClose,
    onNavigate,
  });

  // Zoom é sempre resetado para 1x ao trocar de imagem (setas/teclado/
  // miniaturas) e ao fechar o viewer.
  useEffect(() => {
    resetAllZoom();
  }, [currentIndex, open, resetAllZoom]);

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row" role="dialog" aria-modal="true">
      {/* ── Left panel (dark) ── */}
      <div className="flex min-h-0 flex-1 flex-col bg-neutral-950 md:w-[68%] md:flex-none">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-3 py-2.5 text-white/80 text-sm shrink-0 sm:px-5 sm:py-3">
          <span className="text-white/50 tabular-nums shrink-0">
            {currentIndex + 1} de {images.length}
          </span>
          {image.speciesName && (
            <span className="italic font-semibold text-white truncate">{image.speciesName}</span>
          )}
          {image.popularName && (
            <span className="text-white/60 truncate">{image.popularName}</span>
          )}
          <button
            className="ml-auto shrink-0 rounded-full p-1.5 hover:bg-white/10 transition-colors"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Image area — swipeable/scrollable strip, one slide per image */}
        <div className="flex-1 relative min-h-0 bg-neutral-950">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex h-full w-full scroll-smooth [&::-webkit-scrollbar]:hidden ${
              isZoomed ? "overflow-hidden" : "snap-x snap-mandatory overflow-x-auto"
            }`}
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((img) => (
              <div key={img.id} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
                <ImageViewerSlide
                  image={img}
                  isActive={img.id === image.id}
                  isZoomed={isZoomed}
                  onTransform={(scale) => handleTransformed(img.id, scale)}
                  transformRef={getTransformRefCallback(img.id)}
                />
              </div>
            ))}
          </div>

          {hasPrev && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/40 hover:bg-black/60 text-white transition-colors"
              onClick={() => onNavigate(currentIndex - 1)}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {hasNext && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/40 hover:bg-black/60 text-white transition-colors"
              onClick={() => onNavigate(currentIndex + 1)}
              aria-label="Próxima"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        <ImageViewerThumbnailStrip images={images} currentIndex={currentIndex} onNavigate={onNavigate} />
      </div>

      {/* ── Right panel (white) ── */}
      <ImageViewerDetails image={image} onClose={onClose} user={user} />
    </div>
  );
}

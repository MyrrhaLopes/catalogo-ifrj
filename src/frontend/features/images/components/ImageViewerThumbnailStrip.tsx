import type { ViewerImage } from "./ImageViewer";

type Props = {
  images: ViewerImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
};

export function ImageViewerThumbnailStrip({ images, currentIndex, onNavigate }: Props) {
  if (images.length <= 1) return null;

  return (
    <div className="shrink-0 flex gap-2 px-4 py-3 bg-black/60 overflow-x-auto">
      {images.map((img, i) => (
        <button
          key={img.id}
          onClick={() => onNavigate(i)}
          className={`shrink-0 h-14 w-14 rounded overflow-hidden border-2 transition-all ${
            i === currentIndex
              ? "border-white opacity-100"
              : "border-transparent opacity-50 hover:opacity-80"
          }`}
        >
          {img.url ? (
            <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-neutral-700 flex items-center justify-center">
              <span className="text-xs text-neutral-400">?</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

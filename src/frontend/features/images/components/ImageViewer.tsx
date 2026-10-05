import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Globe, Camera, Pencil, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import useAuth from "@/frontend/shared/hooks/useAuth";

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
  specimen?: { code: string; shelf: number | null; lot: number | null } | null;
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
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, currentIndex, onClose, onNavigate]);

  if (!open || !image) return null;

  const isAcervo = (image.type ?? "online") === "acervo";
  const breadcrumb = image.taxonomyPath
    ?.map((n) => n.labelValue.toLowerCase())
    .join(" › ");

  const createdAt = image.createdAt
    ? new Date(image.createdAt).toLocaleDateString("pt-BR")
    : null;

  const sourceHostname = image.source
    ? (() => { try { return new URL(image.source).hostname; } catch { return image.source; } })()
    : null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* ── Left panel (dark) ── */}
      <div className="flex flex-col bg-neutral-950" style={{ width: "68%" }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 text-white/80 text-sm shrink-0">
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

        {/* Image area */}
        <div className="flex-1 relative flex items-center justify-center min-h-0 bg-neutral-950">
          {image.url ? (
            <img
              src={image.url}
              alt={image.alt ?? ""}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-500">
              <div className="w-16 h-16 rounded border-2 border-neutral-600 flex items-center justify-center">
                <span className="text-2xl">🖼</span>
              </div>
              {image.alt && (
                <p className="text-sm text-neutral-400">[{image.alt}]</p>
              )}
            </div>
          )}

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
        {images.length > 1 && (
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
        )}
      </div>

      {/* ── Right panel (white) ── */}
      <div className="flex flex-col bg-white overflow-y-auto" style={{ width: "32%" }}>
        <div className="flex-1 px-6 py-6 space-y-5">
          {/* Origin badge */}
          <div>
            {isAcervo ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-3 py-1 text-xs font-medium text-white">
                <Camera className="h-3 w-3" />
                Acervo IFRJ · foto presencial
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-700 px-3 py-1 text-xs font-medium text-green-800">
                <Globe className="h-3 w-3" />
                Referência online
              </span>
            )}
          </div>

          {/* Species info */}
          {image.speciesName && (
            <div>
              <h2 className="text-xl font-bold italic text-neutral-900 leading-tight">
                {image.speciesName}
              </h2>
              {image.popularName && (
                <p className="text-sm text-neutral-600 mt-0.5">{image.popularName}</p>
              )}
              {breadcrumb && (
                <p className="text-xs text-neutral-400 mt-1">{breadcrumb}</p>
              )}
            </div>
          )}

          {/* FONTE (online) */}
          {!isAcervo && (image.source || image.credit) && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                Fonte
              </p>
              <div className="space-y-1.5 text-sm">
                {image.source && (
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-500">Site</span>
                    <a
                      href={image.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      {sourceHostname}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {image.credit && (
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-500">Crédito</span>
                    <span className="text-neutral-700 text-right">{image.credit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXEMPLAR (acervo) */}
          {isAcervo && image.specimen && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                Exemplar
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Código</span>
                  <span className="font-semibold text-neutral-900">{image.specimen.code}</span>
                </div>
                {image.specimen.shelf != null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Prateleira</span>
                    <span className="font-semibold text-neutral-900">{image.specimen.shelf}</span>
                  </div>
                )}
                {image.specimen.lot != null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Lote</span>
                    <span className="font-semibold text-neutral-900">{image.specimen.lot}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DESCRIÇÃO */}
          {image.alt && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-1.5">
                Descrição
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">{image.alt}</p>
            </div>
          )}

          {/* APARECE EM */}
          {image.speciesId && image.speciesName && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                Aparece em
              </p>
              <Link
                to="/especies/$id"
                params={{ id: String(image.speciesId) }}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors group"
              >
                <div className="h-10 w-10 rounded overflow-hidden shrink-0 bg-neutral-100">
                  {(image.speciesThumbnail ?? image.url) && (
                    <img
                      src={image.speciesThumbnail ?? image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold italic text-neutral-900 truncate">
                    {image.speciesName}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    Artigo da espécie{image.popularName ? ` · ${image.popularName}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
              </Link>
            </div>
          )}

          {/* Date */}
          {createdAt && (
            <p className="text-xs text-neutral-400">Adicionada em {createdAt}</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 flex gap-2 px-6 pb-5">
          <a
            href={image.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar
          </a>
          {user?.isAdmin && image.speciesId && (
            <Link
              to="/admin"
              search={{ section: "images" as const }}
              onClick={onClose}
              className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
              title="Editar imagem"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { ChevronRight, Download, Globe, Camera, Pencil, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ViewerImage } from "./ImageViewer";

type ImageViewerDetailsProps = {
  image: ViewerImage;
  onClose: () => void;
  user: { isAdmin?: boolean } | null | undefined;
};

function ImageViewerOriginBadge({ isAcervo }: { isAcervo: boolean }) {
  if (isAcervo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-3 py-1 text-xs font-medium text-white">
        <Camera className="h-3 w-3" />
        Acervo IFRJ · foto presencial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-700 px-3 py-1 text-xs font-medium text-green-800">
      <Globe className="h-3 w-3" />
      Referência online
    </span>
  );
}

function ImageViewerSpeciesHeader({
  speciesName,
  popularName,
  breadcrumb,
}: {
  speciesName?: string | null;
  popularName?: string | null;
  breadcrumb?: string;
}) {
  if (!speciesName) return null;
  return (
    <div>
      <h2 className="text-xl font-bold italic text-neutral-900 leading-tight">
        {speciesName}
      </h2>
      {popularName && <p className="text-sm text-neutral-600 mt-0.5">{popularName}</p>}
      {breadcrumb && <p className="text-xs text-neutral-400 mt-1">{breadcrumb}</p>}
    </div>
  );
}

function SourceLinkRow({ source, hostname }: { source: string; hostname?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-neutral-500">Site</span>
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-700 hover:underline flex items-center gap-0.5 font-medium"
      >
        {hostname}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function CreditRow({ credit }: { credit: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-neutral-500">Crédito</span>
      <span className="text-neutral-700 text-right">{credit}</span>
    </div>
  );
}

function ImageViewerOnlineSource({
  source,
  credit,
  sourceHostname,
}: {
  source?: string | null;
  credit?: string | null;
  sourceHostname?: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
        Fonte
      </p>
      <div className="space-y-1.5 text-sm">
        {source ? <SourceLinkRow source={source} hostname={sourceHostname} /> : null}
        {credit ? <CreditRow credit={credit} /> : null}
      </div>
    </div>
  );
}

function ImageViewerSpecimenInfo({ specimen }: { specimen?: ViewerImage["specimen"] }) {
  if (!specimen) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
        Exemplar
      </p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Código</span>
          <span className="font-semibold text-neutral-900">{specimen.code}</span>
        </div>
        {specimen.exposicao != null && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Exposição</span>
            <span className="font-semibold text-neutral-900">
              {specimen.exposicao === "seca" ? "Seca" : "Húmida"}
            </span>
          </div>
        )}
        {specimen.shelf != null && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Prateleira</span>
            <span className="font-semibold text-neutral-900">{specimen.shelf}</span>
          </div>
        )}
        {specimen.lot != null && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Lote</span>
            <span className="font-semibold text-neutral-900">{specimen.lot}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getSpeciesSubtitle(popularName?: string | null) {
  return popularName ? `Artigo da espécie · ${popularName}` : "Artigo da espécie";
}

function getSpeciesThumbnail(speciesThumbnail?: string | null, url?: string | null) {
  return speciesThumbnail || url || "";
}

function ImageViewerSpeciesThumbnail({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div className="h-10 w-10 rounded overflow-hidden shrink-0 bg-neutral-100">
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function ImageViewerSpeciesLink({ image, onClose }: { image: ViewerImage; onClose: () => void }) {
  const { speciesId, speciesName } = image;
  if (!speciesId || !speciesName) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
        Aparece em
      </p>
      <Link
        to="/especies/$id"
        params={{ id: String(speciesId) }}
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors group"
      >
        <ImageViewerSpeciesThumbnail src={getSpeciesThumbnail(image.speciesThumbnail, image.url)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold italic text-neutral-900 truncate">
            {speciesName}
          </p>
          <p className="text-xs text-neutral-500 truncate">{getSpeciesSubtitle(image.popularName)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
      </Link>
    </div>
  );
}

function ImageViewerFooterActions({
  url,
  speciesId,
  isAdmin,
  onClose,
}: {
  url: string;
  speciesId?: number | null;
  isAdmin?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="shrink-0 flex gap-2 px-4 pb-5 sm:px-6">
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <Download className="h-4 w-4" />
        Baixar
      </a>
      {isAdmin && speciesId && (
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
  );
}

function parseHostname(source?: string | null) {
  if (!source) return null;
  try {
    return new URL(source).hostname;
  } catch {
    return source;
  }
}

function formatTaxonomyBreadcrumb(path?: ViewerImage["taxonomyPath"]) {
  return path?.map((n) => n.labelValue.toLowerCase()).join(" › ");
}

function formatCreationDate(dateStr?: string | null) {
  return dateStr ? new Date(dateStr).toLocaleDateString("pt-BR") : null;
}

function ImageViewerDescription({ alt }: { alt?: string | null }) {
  if (!alt) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-1.5">
        Descrição
      </p>
      <p className="text-sm text-neutral-700 leading-relaxed">{alt}</p>
    </div>
  );
}

function ImageViewerCreationDate({ date }: { date: string | null }) {
  if (!date) return null;
  return <p className="text-xs text-neutral-400">Adicionada em {date}</p>;
}

export function ImageViewerDetails({ image, onClose, user }: ImageViewerDetailsProps) {
  const isAcervo = image.type === "acervo";
  const breadcrumb = formatTaxonomyBreadcrumb(image.taxonomyPath);
  const createdAt = formatCreationDate(image.createdAt);
  const sourceHostname = parseHostname(image.source);

  return (
    <div className="flex max-h-[45vh] flex-col overflow-y-auto bg-white md:max-h-none md:w-[32%]">
      <div className="flex-1 px-4 py-5 space-y-5 sm:px-6 sm:py-6">
        <div>
          <ImageViewerOriginBadge isAcervo={isAcervo} />
        </div>
        <ImageViewerSpeciesHeader
          speciesName={image.speciesName}
          popularName={image.popularName}
          breadcrumb={breadcrumb}
        />
        {isAcervo ? (
          <ImageViewerSpecimenInfo specimen={image.specimen} />
        ) : (
          <ImageViewerOnlineSource
            source={image.source}
            credit={image.credit}
            sourceHostname={sourceHostname}
          />
        )}
        <ImageViewerDescription alt={image.alt} />
        <ImageViewerSpeciesLink image={image} onClose={onClose} />
        <ImageViewerCreationDate date={createdAt} />
      </div>

      <ImageViewerFooterActions
        url={image.url}
        speciesId={image.speciesId}
        isAdmin={user?.isAdmin}
        onClose={onClose}
      />
    </div>
  );
}

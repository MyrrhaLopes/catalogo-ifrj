import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, Pencil } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ImageViewer, type ViewerImage } from "@/frontend/features/images/components/ImageViewer";
import { StarButton } from "./StarButton";
import { cn } from "@/lib/utils";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { GalleryImage } from "@/frontend/features/images/images.api";

type SpeciesHeroProps = {
  species: SpeciesDetails;
  scientificName: string;
  popularName: string | undefined;
  isAdmin: boolean;
  isEditMode: boolean;
  id: string;
};

export function SpeciesHero({ species, scientificName, popularName, isAdmin, isEditMode, id }: SpeciesHeroProps) {
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const heroImage = species.thumbnailImage ?? species.images[0];
  const heroImages: GalleryImage[] = heroImage
    ? [heroImage, ...species.images.filter((img) => img.id !== heroImage.id)]
    : species.images;
  const thumbnails = heroImages.slice(1, 5);

  const viewerImages: ViewerImage[] = heroImages.map((img) => {
    const specimen = img.specimenId != null
      ? species.specimens.find((s) => s.id === img.specimenId) ?? null
      : null;
    return {
      ...img,
      speciesName: scientificName,
      popularName: popularName ?? null,
      taxonomyPath: species.taxonomyPath.map((n) => ({ label: n.label, labelValue: n.labelValue })),
      specimen: specimen ? { code: specimen.code, shelf: specimen.shelf, lot: specimen.lot } : null,
      speciesThumbnail: species.thumbnailImage?.url ?? null,
    };
  });

  return (
    <>
      <section
        className={cn(
          "bg-[#e8f2d0] grid overflow-hidden lg:h-[420px] tv:h-[34rem]",
          thumbnails.length > 0 ? "lg:grid-cols-[1fr_1fr_160px] tv:grid-cols-[1fr_1fr_220px]" : "lg:grid-cols-2",
        )}
      >
        <div className="order-2 flex flex-col justify-end px-6 py-8 sm:px-8 md:px-10 lg:order-1 lg:px-12 lg:py-10 tv:px-16 tv:py-14">
          <Breadcrumb nodes={species.taxonomyPath} />
          <h1 className="mt-4 text-3xl font-bold italic leading-tight text-neutral-900 sm:text-4xl md:text-5xl lg:mt-6 tv:text-6xl">
            {scientificName}
          </h1>
          {popularName && <p className="mt-1 text-base text-neutral-600 md:text-lg tv:text-xl">{popularName}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 self-start">
            {isAdmin && !isEditMode && (
              <>
                <Button size="sm" variant="outline" className="bg-white/80 border-neutral-400 hover:bg-white hover:border-neutral-600"
                  onClick={() => void navigate({ to: "/especies/$id", params: { id }, search: { editArticle: true } })}>
                  <Pencil className="h-3 w-3 mr-1" />Editar Artigo
                </Button>
                <Button size="sm" variant="outline" className="bg-white/80 border-neutral-400 hover:bg-white hover:border-neutral-600"
                  onClick={() => void navigate({ to: "/admin", search: { section: "species" as const, selectedSpeciesId: Number(id) } })}>
                  <FlaskConical className="h-3 w-3 mr-1" />Editar Espécie
                </Button>
              </>
            )}
            <StarButton speciesId={Number(id)} />
          </div>
          {species.specimens.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
              {species.specimens.map((s, i) => (
                <span key={s.id} className="flex items-center gap-1 text-xs text-neutral-700 tv:text-sm">
                  {i > 0 && <span className="text-neutral-400">·</span>}
                  <span className="font-medium">{s.code}</span>
                  {(s.shelf != null || s.lot != null) && (
                    <span className="text-neutral-500">
                      {[s.shelf != null ? `Prateleira ${s.shelf}` : null, s.lot != null ? `Lote ${s.lot}` : null].filter(Boolean).join(" | ")}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="order-1 bg-[#e8f2d0] md:h-72 lg:order-2 lg:h-full">
          <HeroImage image={heroImages[0]} alt={scientificName} onClick={() => { setViewerIndex(0); setViewerOpen(true); }} />
        </div>
        {thumbnails.length > 0 && (
          <div className="order-3 flex gap-2 overflow-x-auto px-6 py-3 sm:px-8 md:px-10 lg:flex-col lg:gap-0 lg:overflow-visible lg:p-0">
            {thumbnails.map((img, i) => (
              <ThumbnailImage key={img.id} image={img} alt={img.alt ?? scientificName} onClick={() => { setViewerIndex(i + 1); setViewerOpen(true); }} />
            ))}
          </div>
        )}
      </section>
      <ImageViewer images={viewerImages} initialIndex={viewerIndex} currentIndex={viewerIndex} open={viewerOpen} onClose={() => setViewerOpen(false)} onNavigate={setViewerIndex} />
    </>
  );
}

function Breadcrumb({ nodes }: { nodes: Array<{ id: number; labelValue: string }> }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-neutral-600 flex-wrap">
      {nodes.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-400">&gt;</span>}
          <span className="underline">{node.labelValue}</span>
        </span>
      ))}
    </nav>
  );
}

function HeroImage({ image, alt, onClick }: { image: GalleryImage | undefined; alt: string; onClick?: () => void }) {
  if (!image) return <div className="h-48 w-full flex items-center justify-center bg-neutral-200 text-neutral-400 text-sm md:h-full">Sem imagem</div>;
  return (
    <img
      src={image.url}
      alt={image.alt ?? alt}
      className={cn("w-full h-auto max-h-[70vh] object-contain md:h-full md:max-h-none md:object-cover", onClick && "cursor-pointer")}
      onClick={onClick}
    />
  );
}

function ThumbnailImage({ image, alt, onClick }: { image: GalleryImage; alt: string; onClick?: () => void }) {
  return (
    <div
      className={cn(
        "h-20 w-20 shrink-0 overflow-hidden lg:h-auto lg:w-full lg:flex-1 lg:shrink lg:min-h-0",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      <img src={image.url} alt={image.alt ?? alt} className="w-full h-full object-cover" />
    </div>
  );
}

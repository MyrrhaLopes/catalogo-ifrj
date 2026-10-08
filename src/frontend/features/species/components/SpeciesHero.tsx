import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, Pencil } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ImageViewer, type ViewerImage } from "@/frontend/features/images/components/ImageViewer";
import { StarButton } from "./StarButton";
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
      <section className={`bg-[#e8f2d0] grid h-[420px] overflow-hidden ${thumbnails.length > 0 ? "grid-cols-[1fr_1fr_160px]" : "grid-cols-[1fr_1fr]"}`}>
        <div className="flex flex-col justify-end px-12 py-10">
          <Breadcrumb nodes={species.taxonomyPath} />
          <h1 className="text-5xl font-bold italic text-neutral-900 mt-6 leading-tight">{scientificName}</h1>
          {popularName && <p className="text-lg text-neutral-600 mt-1">{popularName}</p>}
          <div className="flex gap-2 mt-4 self-start items-center">
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
                <span key={s.id} className="flex items-center gap-1 text-xs text-neutral-700">
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
        <HeroImage image={heroImages[0]} alt={scientificName} onClick={() => { setViewerIndex(0); setViewerOpen(true); }} />
        {thumbnails.length > 0 && (
          <div className="flex flex-col grid-cols-[1fr]">
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
  if (!image) return <div className="bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">Sem imagem</div>;
  return <img src={image.url} alt={image.alt ?? alt} className={`w-full grid-cols-[2fr] h-full object-cover ${onClick ? "cursor-pointer" : ""}`} onClick={onClick} />;
}

function ThumbnailImage({ image, alt, onClick }: { image: GalleryImage; alt: string; onClick?: () => void }) {
  return (
    <div className={`flex-1 min-h-0 overflow-hidden ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <img src={image.url} alt={image.alt ?? alt} className="w-full h-full object-cover" />
    </div>
  );
}

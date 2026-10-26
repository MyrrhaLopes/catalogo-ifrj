import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { GalleryImage } from "@/frontend/features/images/images.api";
import type { ViewerImage } from "@/frontend/features/images/components/ImageViewer";

export function getHeroImages(species: SpeciesDetails): GalleryImage[] {
  const heroImage = species.thumbnailImage ?? species.images[0];
  return heroImage
    ? [heroImage, ...species.images.filter((img) => img.id !== heroImage.id)]
    : species.images;
}

export function buildSpeciesViewerImages(
  species: SpeciesDetails,
  scientificName: string,
  popularName: string | undefined,
  extraImageUrls: string[] = [],
): ViewerImage[] {
  const heroImages = getHeroImages(species);

  const baseViewerImages: ViewerImage[] = heroImages.map((img) => {
    const specimen = img.specimenId != null
      ? species.specimens.find((s) => s.id === img.specimenId) ?? null
      : null;
    return {
      ...img,
      speciesName: scientificName,
      popularName: popularName ?? null,
      taxonomyPath: species.taxonomyPath.map((n) => ({ label: n.label, labelValue: n.labelValue })),
      specimen: specimen
        ? { code: specimen.code, exposicao: specimen.exposicao, shelf: specimen.shelf, lot: specimen.lot }
        : null,
      speciesThumbnail: species.thumbnailImage?.url ?? null,
    };
  });

  const existingUrls = new Set(heroImages.map((img) => img.url));
  const additionalViewerImages: ViewerImage[] = [];

  for (let i = 0; i < extraImageUrls.length; i++) {
    const url = extraImageUrls[i];
    if (url && !existingUrls.has(url)) {
      existingUrls.add(url);
      additionalViewerImages.push({
        id: -(i + 1),
        url,
        alt: null,
        speciesName: scientificName,
        popularName: popularName ?? null,
        taxonomyPath: species.taxonomyPath.map((n) => ({ label: n.label, labelValue: n.labelValue })),
        specimen: null,
        speciesThumbnail: species.thumbnailImage?.url ?? null,
      });
    }
  }

  return [...baseViewerImages, ...additionalViewerImages];
}

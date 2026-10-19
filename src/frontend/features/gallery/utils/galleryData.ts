import { filterByTaxonomyPath } from "./filterTaxonomy";
import type { EnrichedImage, GroupBy, Origin } from "../gallery.api";
import type { ImageGroup } from "../components/SpeciesGroup";

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;

type GroupDescriptor = {
  key: string;
  label: string;
  sublabel: string | null;
  speciesId: number | null;
};

function describeTaxonGroup(img: EnrichedImage, taxLabel: string, unknownLabel: string): GroupDescriptor {
  const node = img.taxonomyPath.find((n) => n.label === taxLabel);
  return {
    key: node?.labelValue ?? `__sem_${taxLabel.toLowerCase()}`,
    label: node?.labelValue ?? unknownLabel,
    sublabel: null,
    speciesId: null,
  };
}

function describeGroup(img: EnrichedImage, by: GroupBy): GroupDescriptor {
  if (by === "especie") {
    return {
      key: String(img.speciesId),
      label: img.speciesName,
      sublabel: img.popularName,
      speciesId: img.speciesId,
    };
  }
  if (by === "familia") return describeTaxonGroup(img, "Família", "Família desconhecida");
  if (by === "ordem") return describeTaxonGroup(img, "Ordem", "Ordem desconhecida");

  const d = new Date(img.createdAt);
  return {
    key: `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`,
    label: `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`,
    sublabel: null,
    speciesId: null,
  };
}

export function groupImages(images: EnrichedImage[], by: GroupBy): ImageGroup[] {
  const map = new Map<string, GroupDescriptor & { images: EnrichedImage[] }>();

  for (const img of images) {
    const descriptor = describeGroup(img, by);
    const entry = map.get(descriptor.key) ?? { ...descriptor, images: [] };
    entry.images.push(img);
    map.set(descriptor.key, entry);
  }

  return [...map.values()].map(({ images: imgs, ...descriptor }) => ({
    ...descriptor,
    acervoCount: imgs.filter((i) => i.type === "acervo").length,
    onlineCount: imgs.filter((i) => i.type === "online").length,
    images: imgs,
  }));
}

export function extractTaxonomyLabels(allImages: EnrichedImage[]): string[] {
  const labels = allImages.flatMap((img) => img.taxonomyPath.map((node) => node.label));
  return [...new Set(labels)];
}

export function matchesGalleryQuery(img: EnrichedImage, q: string): boolean {
  const haystacks = [img.speciesName, img.popularName, img.specimen?.code, img.alt];
  return haystacks.some((value) => value?.toLowerCase().includes(q));
}

export function filterGalleryImages(
  allImages: EnrichedImage[],
  origin: Origin,
  taxLabels: string[],
  taxPath: string[],
  search: string,
): EnrichedImage[] {
  const byOrigin = origin === "all" ? allImages : allImages.filter((i) => i.type === origin);
  const byTax = filterByTaxonomyPath(byOrigin, taxLabels, taxPath);
  const q = search.trim().toLowerCase();
  return q ? byTax.filter((i) => matchesGalleryQuery(i, q)) : byTax;
}

export function countImagesByOrigin(allImages: EnrichedImage[]) {
  const acervoTotal = allImages.filter((i) => i.type === "acervo").length;
  const onlineTotal = allImages.filter((i) => i.type === "online").length;
  return { acervoTotal, onlineTotal };
}

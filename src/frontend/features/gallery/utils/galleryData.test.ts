import { describe, expect, it } from "vitest";
import type { EnrichedImage } from "../gallery.api";
import {
  countImagesByOrigin,
  extractTaxonomyLabels,
  filterGalleryImages,
  groupImages,
  matchesGalleryQuery,
} from "./galleryData";

function makeImage(overrides: Partial<EnrichedImage> = {}): EnrichedImage {
  return {
    id: 1,
    url: "http://example.com/1.jpg",
    alt: null,
    type: "online",
    source: null,
    credit: null,
    createdAt: "2026-03-15T12:00:00.000Z",
    speciesId: 10,
    speciesName: "Musca domestica",
    popularName: "Mosca-de-casa",
    taxonomyPath: [
      { label: "Ordem", labelValue: "Diptera" },
      { label: "Família", labelValue: "Muscidae" },
    ],
    specimen: null,
    speciesThumbnail: null,
    ...overrides,
  };
}

describe("extractTaxonomyLabels", () => {
  it("returns unique labels in first-seen order", () => {
    const images = [
      makeImage({ taxonomyPath: [{ label: "Ordem", labelValue: "A" }, { label: "Família", labelValue: "B" }] }),
      makeImage({ taxonomyPath: [{ label: "Família", labelValue: "C" }, { label: "Gênero", labelValue: "D" }] }),
    ];
    expect(extractTaxonomyLabels(images)).toEqual(["Ordem", "Família", "Gênero"]);
  });

  it("returns an empty array for no images", () => {
    expect(extractTaxonomyLabels([])).toEqual([]);
  });
});

describe("matchesGalleryQuery", () => {
  it("matches species name, popular name, specimen code and alt", () => {
    expect(matchesGalleryQuery(makeImage(), "musca")).toBe(true);
    expect(matchesGalleryQuery(makeImage(), "mosca-de")).toBe(true);
    expect(matchesGalleryQuery(makeImage({ specimen: { code: "IFRJ-002", shelf: null, lot: null } }), "ifrj-002")).toBe(true);
    expect(matchesGalleryQuery(makeImage({ alt: "Vista lateral" }), "lateral")).toBe(true);
  });

  it("returns false when nothing matches and tolerates null fields", () => {
    expect(matchesGalleryQuery(makeImage({ popularName: null, alt: null }), "zzz")).toBe(false);
  });
});

describe("filterGalleryImages", () => {
  const acervo = makeImage({ id: 1, type: "acervo", speciesName: "Apis mellifera", popularName: null });
  const online = makeImage({ id: 2, type: "online" });
  const all = [acervo, online];

  it("returns everything with no filters", () => {
    expect(filterGalleryImages(all, "all", [], [], "")).toEqual(all);
  });

  it("filters by origin", () => {
    expect(filterGalleryImages(all, "acervo", [], [], "")).toEqual([acervo]);
  });

  it("filters by search text, ignoring case and surrounding whitespace", () => {
    expect(filterGalleryImages(all, "all", [], [], "  APIS ")).toEqual([acervo]);
  });

  it("filters by taxonomy path", () => {
    const other = makeImage({ id: 3, taxonomyPath: [{ label: "Ordem", labelValue: "Hymenoptera" }] });
    expect(filterGalleryImages([online, other], "all", ["Ordem"], ["Hymenoptera"], "")).toEqual([other]);
  });
});

describe("countImagesByOrigin", () => {
  it("counts acervo and online images", () => {
    const images = [makeImage({ type: "acervo" }), makeImage({ type: "online" }), makeImage({ type: "online" })];
    expect(countImagesByOrigin(images)).toEqual({ acervoTotal: 1, onlineTotal: 2 });
  });
});

describe("groupImages", () => {
  const a = makeImage({ id: 1, speciesId: 10, type: "acervo", createdAt: "2026-03-15T12:00:00.000Z" });
  const b = makeImage({ id: 2, speciesId: 10, type: "online", createdAt: "2026-03-20T12:00:00.000Z" });
  const c = makeImage({
    id: 3,
    speciesId: 20,
    speciesName: "Apis mellifera",
    popularName: null,
    taxonomyPath: [],
    createdAt: "2026-04-02T12:00:00.000Z",
  });

  it("groups by species with counts and sublabel", () => {
    const groups = groupImages([a, b, c], "especie");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      key: "10",
      label: "Musca domestica",
      sublabel: "Mosca-de-casa",
      speciesId: 10,
      acervoCount: 1,
      onlineCount: 1,
    });
    expect(groups[0].images).toEqual([a, b]);
  });

  it("groups by family and falls back when the taxon is missing", () => {
    const groups = groupImages([a, c], "familia");
    expect(groups.map((g) => g.label)).toEqual(["Muscidae", "Família desconhecida"]);
    expect(groups[1].key).toBe("__sem_família");
  });

  it("groups by order and falls back when the taxon is missing", () => {
    const groups = groupImages([a, c], "ordem");
    expect(groups.map((g) => g.label)).toEqual(["Diptera", "Ordem desconhecida"]);
  });

  it("groups by month", () => {
    const groups = groupImages([a, b, c], "data");
    expect(groups).toHaveLength(2);
    expect(groups[0].images).toEqual([a, b]);
    expect(groups[0].speciesId).toBeNull();
  });
});

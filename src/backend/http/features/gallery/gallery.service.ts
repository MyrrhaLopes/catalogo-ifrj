import { db } from "@/backend/db/drizzle";
import {
  imageTable,
  articleTable,
  speciesTable,
  specimenTable,
  popularNameTable,
  speciesPopularNamePivot,
} from "@/backend/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export type GalleryImageData = {
  id: number;
  url: string;
  alt: string | null;
  type: "online" | "acervo";
  source: string | null;
  credit: string | null;
  createdAt: string;
  speciesId: number;
  speciesName: string;
  popularName: string | null;
  taxonomyPath: { label: string; labelValue: string }[];
  specimen: { code: string; shelf: number | null; lot: number | null } | null;
  speciesThumbnail: string | null;
};

function getScientificName(path: { label: string; labelValue: string }[]): string {
  const last = path.at(-1);
  const secondLast = path.at(-2);
  if (last?.label === "Espécie" && secondLast) return `${secondLast.labelValue} ${last.labelValue}`;
  return last?.labelValue ?? "";
}

export const GALLERY_SERVICE = {
  getGallery: async (): Promise<GalleryImageData[]> => {
    const imageRows = await db
      .select({
        id: imageTable.id,
        url: imageTable.url,
        alt: imageTable.alt,
        type: imageTable.type,
        source: imageTable.source,
        credit: imageTable.credit,
        createdAt: imageTable.createdAt,
        specimenId: imageTable.specimenId,
        speciesId: articleTable.species,
      })
      .from(imageTable)
      .innerJoin(articleTable, eq(imageTable.article, articleTable.id));

    if (imageRows.length === 0) return [];

    const speciesIds = [...new Set(imageRows.map((r) => r.speciesId))];
    const idsLiteral = `{${speciesIds.join(",")}}`;

    // Taxonomy paths via recursive CTE (root first = depth DESC)
    const pathRows = await db.execute(sql`
      WITH RECURSIVE tax_path AS (
        SELECT s.id AS species_id, t.id AS node_id, t.label, t.label_value, t.parent, 0 AS depth
        FROM species s
        INNER JOIN taxonomies t ON t.id = s.sepecies
        WHERE s.id = ANY(${idsLiteral}::int[])
        UNION
        SELECT tp.species_id, t.id, t.label, t.label_value, t.parent, tp.depth + 1
        FROM tax_path tp
        INNER JOIN taxonomies t ON t.id = tp.parent
        WHERE t.id <> tp.node_id
      )
      SELECT species_id, label, label_value
      FROM tax_path
      ORDER BY species_id, depth DESC
    `);

    const popRows = await db
      .select({
        speciesId: speciesPopularNamePivot.speciesId,
        name: popularNameTable.name,
      })
      .from(popularNameTable)
      .innerJoin(
        speciesPopularNamePivot,
        eq(popularNameTable.id, speciesPopularNamePivot.popularNameId),
      )
      .where(inArray(speciesPopularNamePivot.speciesId, speciesIds));

    const speciesMetaRows = await db
      .select({ id: speciesTable.id, thumbnailImageId: speciesTable.thumbnailImageId })
      .from(speciesTable)
      .where(inArray(speciesTable.id, speciesIds));

    const thumbnailImageIds = speciesMetaRows
      .map((s) => s.thumbnailImageId)
      .filter((id): id is number => id != null);

    const thumbnailUrlMap = new Map<number, string>();
    if (thumbnailImageIds.length > 0) {
      const thumbRows = await db
        .select({ id: imageTable.id, url: imageTable.url })
        .from(imageTable)
        .where(inArray(imageTable.id, thumbnailImageIds));
      for (const r of thumbRows) thumbnailUrlMap.set(r.id, r.url);
    }

    const specimenIds = imageRows
      .map((r) => r.specimenId)
      .filter((id): id is number => id != null);

    const specimenMap = new Map<
      number,
      { code: string; shelf: number | null; lot: number | null }
    >();
    if (specimenIds.length > 0) {
      const specRows = await db
        .select({
          id: specimenTable.id,
          code: specimenTable.code,
          shelf: specimenTable.shelf,
          lot: specimenTable.lot,
        })
        .from(specimenTable)
        .where(inArray(specimenTable.id, specimenIds));
      for (const r of specRows)
        specimenMap.set(r.id, { code: r.code, shelf: r.shelf, lot: r.lot });
    }

    type PathRow = { species_id: number; label: string; label_value: string };
    const pathsBySpecies = new Map<number, { label: string; labelValue: string }[]>();
    for (const r of pathRows.rows as PathRow[]) {
      const list = pathsBySpecies.get(r.species_id) ?? [];
      list.push({ label: r.label, labelValue: r.label_value });
      pathsBySpecies.set(r.species_id, list);
    }

    const popularNameBySpecies = new Map<number, string>();
    for (const r of popRows) {
      if (r.speciesId != null && !popularNameBySpecies.has(r.speciesId)) {
        popularNameBySpecies.set(r.speciesId, r.name);
      }
    }

    const thumbnailBySpecies = new Map<number, string | null>();
    for (const s of speciesMetaRows) {
      const url = s.thumbnailImageId
        ? (thumbnailUrlMap.get(s.thumbnailImageId) ?? null)
        : null;
      thumbnailBySpecies.set(s.id, url);
    }

    return imageRows.map((r) => {
      const path = pathsBySpecies.get(r.speciesId) ?? [];
      return {
        id: r.id,
        url: r.url,
        alt: r.alt,
        type: (r.type ?? "online") as "online" | "acervo",
        source: r.source,
        credit: r.credit,
        createdAt: r.createdAt.toISOString(),
        speciesId: r.speciesId,
        speciesName: getScientificName(path),
        popularName: popularNameBySpecies.get(r.speciesId) ?? null,
        taxonomyPath: path,
        specimen: r.specimenId ? (specimenMap.get(r.specimenId) ?? null) : null,
        speciesThumbnail: thumbnailBySpecies.get(r.speciesId) ?? null,
      };
    });
  },
};

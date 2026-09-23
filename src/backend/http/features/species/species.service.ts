import { db } from "@/backend/db/drizzle";
import {
  speciesTable,
  specimenTable,
  popularNameTable,
  speciesPopularNamePivot,
  taxonomyTable,
  attributeTable,
  attributeTemplateTable,
  type SpeciesTableInsert,
} from "@/backend/db/schema";
import { eq, inArray, sql, type SQL } from "drizzle-orm";
import type { SpeciesSearchResult } from "./species.schema";

export const SPECIES_SERVICE = {
  registerSpecie: async (values: SpeciesTableInsert) => {
    const [newSpecies] = await db
      .insert(speciesTable)
      .values(values)
      .returning();
    return newSpecies;
  },

  getSpecies: async () => {
    const rows = await db
      .select({
        id: speciesTable.id,
        speciesRoot: speciesTable.speciesRoot,
        createdAt: speciesTable.createdAt,
        createdBy: speciesTable.createdBy,
        specimenId: specimenTable.id,
        specimenCode: specimenTable.code,
      })
      .from(speciesTable)
      .leftJoin(specimenTable, eq(specimenTable.speciesId, speciesTable.id));

    const map = new Map<number, {
      id: number;
      speciesRoot: number;
      createdAt: Date | null;
      createdBy: string;
      specimens: { id: number; code: string }[];
    }>();

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          speciesRoot: row.speciesRoot,
          createdAt: row.createdAt,
          createdBy: row.createdBy,
          specimens: [],
        });
      }
      if (row.specimenId != null && row.specimenCode != null) {
        map.get(row.id)!.specimens.push({ id: row.specimenId, code: row.specimenCode });
      }
    }

    return [...map.values()].map((s) => ({
      ...s,
      createdAt: s.createdAt?.toISOString() ?? null,
    }));
  },

  getSpecieById: async (specieId: number, options: { withTaxonomy?: boolean } = {}) => {
    const [species] = await db
      .select()
      .from(speciesTable)
      .where(eq(speciesTable.id, specieId));

    if (!species) return null;

    const specimenRows = await db
      .select({ id: specimenTable.id, code: specimenTable.code })
      .from(specimenTable)
      .where(eq(specimenTable.speciesId, specieId));

    if (!options.withTaxonomy) return { ...species, specimens: specimenRows };

    // Walk taxonomy tree upward to build breadcrumb (cycle-safe via visited set)
    const taxonomyPath: Array<{ id: number; label: string; labelValue: string }> = [];
    const visited = new Set<number>();
    let currentId: number | null = species.speciesRoot;

    while (currentId !== null && !visited.has(currentId)) {
      visited.add(currentId);
      const [node] = await db
        .select({
          id: taxonomyTable.id,
          label: taxonomyTable.label,
          labelValue: taxonomyTable.labelValue,
          parent: taxonomyTable.parent,
        })
        .from(taxonomyTable)
        .where(eq(taxonomyTable.id, currentId));

      if (!node) break;
      taxonomyPath.unshift({ id: node.id, label: node.label, labelValue: node.labelValue });
      currentId = node.parent === currentId ? null : node.parent;
    }

    const popularNames = await db
      .select({
        id: popularNameTable.id,
        name: popularNameTable.name,
        origin: popularNameTable.origin,
      })
      .from(popularNameTable)
      .innerJoin(
        speciesPopularNamePivot,
        eq(popularNameTable.id, speciesPopularNamePivot.popularNameId),
      )
      .where(eq(speciesPopularNamePivot.speciesId, specieId));

    const attributes = await db
      .select({
        label: attributeTemplateTable.label,
        value: attributeTable.value,
        unit: attributeTemplateTable.unit,
      })
      .from(attributeTable)
      .innerJoin(
        attributeTemplateTable,
        eq(attributeTable.attribute, attributeTemplateTable.id),
      )
      .where(eq(attributeTable.species, specieId));

    return { ...species, specimens: specimenRows, taxonomyPath, popularNames, attributes };
  },

  deleteSpecie: async (specieId: number) => {
    await db.delete(speciesTable).where(eq(speciesTable.id, specieId));
  },

  addPopularName: async (specieId: number, name: string, origin?: string) => {
    const [popularName] = await db
      .insert(popularNameTable)
      .values({ name, origin })
      .returning();
    await db
      .insert(speciesPopularNamePivot)
      .values({ speciesId: specieId, popularNameId: popularName.id });
    return popularName;
  },

  setSpeciesAttributes: async (
    speciesId: number,
    attrs: Array<{ templateId: number; value: string }>,
  ) => {
    await db.transaction(async (tx) => {
      await tx.delete(attributeTable).where(eq(attributeTable.species, speciesId));
      if (attrs.length > 0) {
        await tx.insert(attributeTable).values(
          attrs.map((a) => ({
            species: speciesId,
            attribute: a.templateId,
            value: a.value,
          })),
        );
      }
    });
  },

  searchSpecies: async (params: {
    q?: string;
    page: number;
    pageSize: number;
    taxNodes?: number[];
    attrs?: Array<{ templateId: number; valueInBaseUnit: number; operator?: "=" | ">" | "<" }>;
  }): Promise<{ species: SpeciesSearchResult[]; total: number; page: number; pageSize: number }> => {
    const { q, page, pageSize, taxNodes, attrs } = params;
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions
    const conditions: SQL[] = [];

    if (q) {
      const qp = `%${q}%`;
      conditions.push(sql`(
        EXISTS (
          SELECT 1 FROM tax_path tp2
          WHERE tp2.species_id = s.id
            AND (tp2.label_value ILIKE ${qp} OR tp2.label ILIKE ${qp})
        )
        OR EXISTS (
          SELECT 1 FROM species_popular_name_pivot piv
          INNER JOIN popular_names pn ON pn.id = piv.popular_name_id
          WHERE piv.species_id = s.id AND pn.name ILIKE ${qp}
        )
        OR EXISTS (
          SELECT 1 FROM articles a
          WHERE a.species = s.id AND CAST(a.content AS TEXT) ILIKE ${qp}
        )
      )`);
    }

    for (const nodeId of taxNodes ?? []) {
      conditions.push(sql`EXISTS (
        SELECT 1 FROM tax_path tp_f
        WHERE tp_f.species_id = s.id AND tp_f.node_id = ${nodeId}
      )`);
    }

    for (const attr of attrs ?? []) {
      const op = attr.operator ?? "=";
      if (op === ">") {
        conditions.push(sql`EXISTS (
          SELECT 1 FROM attributes attr_f
          WHERE attr_f.species = s.id
            AND attr_f.attribute = ${attr.templateId}
            AND CAST(attr_f.value AS NUMERIC) > ${attr.valueInBaseUnit}
        )`);
      } else if (op === "<") {
        conditions.push(sql`EXISTS (
          SELECT 1 FROM attributes attr_f
          WHERE attr_f.species = s.id
            AND attr_f.attribute = ${attr.templateId}
            AND CAST(attr_f.value AS NUMERIC) < ${attr.valueInBaseUnit}
        )`);
      } else {
        conditions.push(sql`EXISTS (
          SELECT 1 FROM attributes attr_f
          WHERE attr_f.species = s.id
            AND attr_f.attribute = ${attr.templateId}
            AND CAST(attr_f.value AS NUMERIC) = ${attr.valueInBaseUnit}
        )`);
      }
    }

    const whereClause =
      conditions.length > 0
        ? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
        : sql`TRUE`;

    const searchRows = await db.execute(sql`
      WITH RECURSIVE tax_path AS (
        SELECT s.id AS species_id, t.id AS node_id, t.label_value, t.label, t.parent
        FROM species s
        INNER JOIN taxonomies t ON t.id = s.sepecies
        UNION
        SELECT tp.species_id, t.id, t.label_value, t.label, t.parent
        FROM tax_path tp
        INNER JOIN taxonomies t ON t.id = tp.parent
        WHERE t.id <> tp.node_id
      ),
      matching AS (
        SELECT DISTINCT s.id AS species_id
        FROM species s
        WHERE ${whereClause}
      )
      SELECT species_id, COUNT(*) OVER()::int AS total
      FROM matching
      ORDER BY species_id
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    const rows = searchRows.rows as Array<{ species_id: number; total: number }>;
    const total = rows[0]?.total ?? 0;
    const speciesIds = rows.map((r) => r.species_id);

    if (speciesIds.length === 0) return { species: [], total, page, pageSize };

    const idsLiteral = `{${speciesIds.join(",")}}`;

    // Batch: taxonomy paths (root → leaf order via depth)
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
      SELECT species_id, node_id AS id, label, label_value AS "labelValue"
      FROM tax_path
      ORDER BY species_id, depth DESC
    `);

    // Batch: popular names
    const popRows = await db
      .select({
        speciesId: speciesPopularNamePivot.speciesId,
        id: popularNameTable.id,
        name: popularNameTable.name,
        origin: popularNameTable.origin,
      })
      .from(popularNameTable)
      .innerJoin(
        speciesPopularNamePivot,
        eq(popularNameTable.id, speciesPopularNamePivot.popularNameId),
      )
      .where(inArray(speciesPopularNamePivot.speciesId, speciesIds));

    // Batch: attributes
    const attrRows = await db
      .select({
        speciesId: attributeTable.species,
        label: attributeTemplateTable.label,
        value: attributeTable.value,
        unit: attributeTemplateTable.unit,
      })
      .from(attributeTable)
      .innerJoin(
        attributeTemplateTable,
        eq(attributeTable.attribute, attributeTemplateTable.id),
      )
      .where(inArray(attributeTable.species, speciesIds));

    // Batch: article thumbnail + excerpt
    const articleRows = await db.execute(sql`
      SELECT
        a.species AS species_id,
        (
          SELECT img.url
          FROM images img
          WHERE img.article = a.id
          ORDER BY img.id
          LIMIT 1
        ) AS thumbnail,
        LEFT((
          SELECT elem->>'content'
          FROM jsonb_array_elements(
            COALESCE(
              a.content->'sections'->'center',
              a.content->'sections'->'left',
              a.content->'sections'->'right',
              '[]'::jsonb
            )
          ) AS elem
          WHERE elem->>'type' = 'text'
          LIMIT 1
        ), 300) AS excerpt
      FROM articles a
      WHERE a.species = ANY(${idsLiteral}::int[])
    `);

    // Batch: specimens via direct FK
    const pivotRows = await db
      .select({
        speciesId: specimenTable.speciesId,
        specimenId: specimenTable.id,
        specimenCode: specimenTable.code,
      })
      .from(specimenTable)
      .where(inArray(specimenTable.speciesId, speciesIds));

    // Batch: speciesRoot per species
    const speciesMetaRows = await db
      .select({ id: speciesTable.id, speciesRoot: speciesTable.speciesRoot })
      .from(speciesTable)
      .where(inArray(speciesTable.id, speciesIds));

    const speciesRootMap = new Map(speciesMetaRows.map((r) => [r.id, r.speciesRoot]));

    // Group fetched data by speciesId
    type PathRow = { species_id: number; id: number; label: string; labelValue: string };
    const pathsBySpecies = new Map<number, PathRow[]>();
    for (const r of pathRows.rows as PathRow[]) {
      const list = pathsBySpecies.get(r.species_id) ?? [];
      list.push(r);
      pathsBySpecies.set(r.species_id, list);
    }

    const popBySpecies = new Map<number, typeof popRows>();
    for (const r of popRows) {
      const list = popBySpecies.get(r.speciesId!) ?? [];
      list.push(r);
      popBySpecies.set(r.speciesId!, list);
    }

    const attrBySpecies = new Map<number, typeof attrRows>();
    for (const r of attrRows) {
      const list = attrBySpecies.get(r.speciesId!) ?? [];
      list.push(r);
      attrBySpecies.set(r.speciesId!, list);
    }

    type ArticleRow = { species_id: number; thumbnail: string | null; excerpt: string | null };
    const articleBySpecies = new Map<number, ArticleRow>();
    for (const r of articleRows.rows as ArticleRow[]) {
      articleBySpecies.set(r.species_id, r);
    }

    const pivotBySpecies = new Map<number, { id: number; code: string }[]>();
    for (const r of pivotRows) {
      if (r.speciesId == null) continue;
      const list = pivotBySpecies.get(r.speciesId) ?? [];
      list.push({ id: r.specimenId, code: r.specimenCode });
      pivotBySpecies.set(r.speciesId, list);
    }

    const species: SpeciesSearchResult[] = speciesIds.map((sid) => ({
      id: sid,
      speciesRoot: speciesRootMap.get(sid) ?? 0,
      specimens: pivotBySpecies.get(sid) ?? [],
      createdAt: null,
      createdBy: "",
      taxonomyPath: (pathsBySpecies.get(sid) ?? []).map((p) => ({
        id: p.id,
        label: p.label,
        labelValue: p.labelValue,
      })),
      popularNames: (popBySpecies.get(sid) ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        origin: p.origin,
      })),
      attributes: (attrBySpecies.get(sid) ?? []).map((a) => ({
        label: a.label,
        value: a.value,
        unit: a.unit,
      })),
      thumbnail: articleBySpecies.get(sid)?.thumbnail ?? null,
      excerpt: articleBySpecies.get(sid)?.excerpt ?? null,
    }));

    return { species, total, page, pageSize };
  },
};

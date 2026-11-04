import { db } from "@/backend/db/drizzle";
import { specimenTable, type SpecimenTableInsert } from "@/backend/db/schema";
import { and, desc, eq, ilike, inArray, sql, type SQL } from "drizzle-orm";

function buildSpecimenSearchWhere(q?: string, exposicao?: ("humida" | "seca")[]): SQL | undefined {
  const conditions: SQL[] = [];
  if (q) conditions.push(ilike(specimenTable.code, `%${q}%`));
  if (exposicao?.length) conditions.push(inArray(specimenTable.exposicao, exposicao));
  if (conditions.length === 0) return undefined;
  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

const specimenSelect = {
  id: specimenTable.id,
  code: specimenTable.code,
  exposicao: specimenTable.exposicao,
  lot: specimenTable.lot,
  shelf: specimenTable.shelf,
  createdAt: specimenTable.createdAt,
  linkedSpeciesId: specimenTable.speciesId,
};

function mapSpecimenRow(row: {
  id: number;
  code: string;
  exposicao: "humida" | "seca";
  lot: number | null;
  shelf: number | null;
  createdAt: Date | null;
  linkedSpeciesId: number | null;
}) {
  return {
    id: row.id,
    code: row.code,
    exposicao: row.exposicao,
    lot: row.lot,
    shelf: row.shelf,
    createdAt: row.createdAt?.toISOString() ?? null,
    linkedSpeciesId: row.linkedSpeciesId ?? null,
  };
}

export const SPECIMEN_SERVICE = {
  registerSpecimen: async (values: SpecimenTableInsert) => {
    const [newSpecimen] = await db.insert(specimenTable).values(values).returning();
    return newSpecimen;
  },

  listSpecimens: async () => {
    const rows = await db
      .select(specimenSelect)
      .from(specimenTable)
      .orderBy(desc(specimenTable.id));

    return rows.map(mapSpecimenRow);
  },

  searchSpecimens: async (params: { q?: string; exposicao?: ("humida" | "seca")[] }) => {
    const whereClause = buildSpecimenSearchWhere(params.q, params.exposicao);
    const rows = await db
      .select(specimenSelect)
      .from(specimenTable)
      .where(whereClause)
      .orderBy(desc(specimenTable.id));

    return rows.map(mapSpecimenRow);
  },

  listSpecimensPaginated: async (params: {
    q?: string;
    page: number;
    pageSize: number;
    exposicao?: ("humida" | "seca")[];
  }) => {
    const { q, page, pageSize, exposicao } = params;
    const offset = (page - 1) * pageSize;
    const whereClause = buildSpecimenSearchWhere(q, exposicao);

    const [rows, [countRow]] = await Promise.all([
      db
        .select(specimenSelect)
        .from(specimenTable)
        .where(whereClause)
        .orderBy(desc(specimenTable.id))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`COUNT(*)::int` }).from(specimenTable).where(whereClause),
    ]);

    return { specimens: rows.map(mapSpecimenRow), total: countRow?.count ?? 0, page, pageSize };
  },

  getSpecimenById: async (id: number) => {
    const [row] = await db
      .select(specimenSelect)
      .from(specimenTable)
      .where(eq(specimenTable.id, id));

    return row ? mapSpecimenRow(row) : null;
  },

  updateSpecimen: async (
    id: number,
    patch: {
      code?: string;
      exposicao?: "humida" | "seca";
      lot?: number | null;
      shelf?: number | null;
      speciesId?: number | null;
    },
  ) => {
    const [updated] = await db
      .update(specimenTable)
      .set(patch)
      .where(eq(specimenTable.id, id))
      .returning();
    return updated ?? null;
  },

  deleteSpecimen: async (id: number) => {
    await db.delete(specimenTable).where(eq(specimenTable.id, id));
  },
};

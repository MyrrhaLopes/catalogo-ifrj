import { db } from "@/backend/db/drizzle";
import { specimenTable, speciesTable, type SpecimenTableInsert } from "@/backend/db/schema";
import { eq, ilike } from "drizzle-orm";

export const SPECIMEN_SERVICE = {
  registerSpecimen: async (values: SpecimenTableInsert) => {
    const [newSpecimen] = await db.insert(specimenTable).values(values).returning();
    return newSpecimen;
  },

  listSpecimens: async () => {
    const rows = await db
      .select({
        id: specimenTable.id,
        code: specimenTable.code,
        lot: specimenTable.lot,
        shelf: specimenTable.shelf,
        createdAt: specimenTable.createdAt,
        linkedSpeciesId: speciesTable.id,
      })
      .from(specimenTable)
      .leftJoin(speciesTable, eq(speciesTable.specimen, specimenTable.id));

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString() ?? null,
      linkedSpeciesId: r.linkedSpeciesId ?? null,
    }));
  },

  searchSpecimens: async (q: string) => {
    const rows = await db
      .select({
        id: specimenTable.id,
        code: specimenTable.code,
        lot: specimenTable.lot,
        shelf: specimenTable.shelf,
        createdAt: specimenTable.createdAt,
        linkedSpeciesId: speciesTable.id,
      })
      .from(specimenTable)
      .leftJoin(speciesTable, eq(speciesTable.specimen, specimenTable.id))
      .where(ilike(specimenTable.code, `%${q}%`));

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString() ?? null,
      linkedSpeciesId: r.linkedSpeciesId ?? null,
    }));
  },

  getSpecimenById: async (id: number) => {
    const [row] = await db
      .select({
        id: specimenTable.id,
        code: specimenTable.code,
        lot: specimenTable.lot,
        shelf: specimenTable.shelf,
        createdAt: specimenTable.createdAt,
        linkedSpeciesId: speciesTable.id,
      })
      .from(specimenTable)
      .leftJoin(speciesTable, eq(speciesTable.specimen, specimenTable.id))
      .where(eq(specimenTable.id, id));

    if (!row) return null;
    return {
      ...row,
      createdAt: row.createdAt?.toISOString() ?? null,
      linkedSpeciesId: row.linkedSpeciesId ?? null,
    };
  },

  updateSpecimen: async (id: number, patch: { code?: string; lot?: number | null; shelf?: number | null }) => {
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

import { db } from "@/backend/db/drizzle";
import { specimenTable, type SpecimenTableInsert } from "@/backend/db/schema";
import { desc, eq, ilike } from "drizzle-orm";

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
        linkedSpeciesId: specimenTable.speciesId,
      })
      .from(specimenTable)
      .orderBy(desc(specimenTable.id));

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      lot: row.lot,
      shelf: row.shelf,
      createdAt: row.createdAt?.toISOString() ?? null,
      linkedSpeciesId: row.linkedSpeciesId ?? null,
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
        linkedSpeciesId: specimenTable.speciesId,
      })
      .from(specimenTable)
      .where(ilike(specimenTable.code, `%${q}%`))
      .orderBy(desc(specimenTable.id));

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      lot: row.lot,
      shelf: row.shelf,
      createdAt: row.createdAt?.toISOString() ?? null,
      linkedSpeciesId: row.linkedSpeciesId ?? null,
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
        linkedSpeciesId: specimenTable.speciesId,
      })
      .from(specimenTable)
      .where(eq(specimenTable.id, id));

    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      lot: row.lot,
      shelf: row.shelf,
      createdAt: row.createdAt?.toISOString() ?? null,
      linkedSpeciesId: row.linkedSpeciesId ?? null,
    };
  },

  updateSpecimen: async (
    id: number,
    patch: { code?: string; lot?: number | null; shelf?: number | null; speciesId?: number | null },
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

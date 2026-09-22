import { db } from "@/backend/db/drizzle";
import { specimenTable, speciesSpecimenPivot, type SpecimenTableInsert } from "@/backend/db/schema";
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
        linkedSpeciesId: speciesSpecimenPivot.speciesId,
      })
      .from(specimenTable)
      .leftJoin(speciesSpecimenPivot, eq(speciesSpecimenPivot.specimenId, specimenTable.id));

    const map = new Map<number, {
      id: number;
      code: string;
      lot: number | null;
      shelf: number | null;
      createdAt: string | null;
      linkedSpeciesIds: number[];
    }>();

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          code: row.code,
          lot: row.lot,
          shelf: row.shelf,
          createdAt: row.createdAt?.toISOString() ?? null,
          linkedSpeciesIds: [],
        });
      }
      if (row.linkedSpeciesId != null) map.get(row.id)!.linkedSpeciesIds.push(row.linkedSpeciesId);
    }

    return [...map.values()];
  },

  searchSpecimens: async (q: string) => {
    const rows = await db
      .select({
        id: specimenTable.id,
        code: specimenTable.code,
        lot: specimenTable.lot,
        shelf: specimenTable.shelf,
        createdAt: specimenTable.createdAt,
        linkedSpeciesId: speciesSpecimenPivot.speciesId,
      })
      .from(specimenTable)
      .leftJoin(speciesSpecimenPivot, eq(speciesSpecimenPivot.specimenId, specimenTable.id))
      .where(ilike(specimenTable.code, `%${q}%`));

    const map = new Map<number, {
      id: number;
      code: string;
      lot: number | null;
      shelf: number | null;
      createdAt: string | null;
      linkedSpeciesIds: number[];
    }>();

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          code: row.code,
          lot: row.lot,
          shelf: row.shelf,
          createdAt: row.createdAt?.toISOString() ?? null,
          linkedSpeciesIds: [],
        });
      }
      if (row.linkedSpeciesId != null) map.get(row.id)!.linkedSpeciesIds.push(row.linkedSpeciesId);
    }

    return [...map.values()];
  },

  getSpecimenById: async (id: number) => {
    const rows = await db
      .select({
        id: specimenTable.id,
        code: specimenTable.code,
        lot: specimenTable.lot,
        shelf: specimenTable.shelf,
        createdAt: specimenTable.createdAt,
        linkedSpeciesId: speciesSpecimenPivot.speciesId,
      })
      .from(specimenTable)
      .leftJoin(speciesSpecimenPivot, eq(speciesSpecimenPivot.specimenId, specimenTable.id))
      .where(eq(specimenTable.id, id));

    if (rows.length === 0) return null;

    const linkedSpeciesIds: number[] = [];
    for (const row of rows) {
      if (row.linkedSpeciesId != null) linkedSpeciesIds.push(row.linkedSpeciesId);
    }

    const first = rows[0];
    return {
      id: first.id,
      code: first.code,
      lot: first.lot,
      shelf: first.shelf,
      createdAt: first.createdAt?.toISOString() ?? null,
      linkedSpeciesIds,
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

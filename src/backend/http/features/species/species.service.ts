import { db } from "@/backend/db/drizzle";
import {
  speciesTable,
  popularNameTable,
  speciesPopularNamePivot,
  type SpeciesTableInsert,
} from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const SPECIES_SERVICE = {
  registerSpecie: async (values: SpeciesTableInsert) => {
    const [newSpecies] = await db
      .insert(speciesTable)
      .values(values)
      .returning();
    return newSpecies;
  },

  getSpecies: async () => {
    return await db.select().from(speciesTable);
  },

  getSpecieById: async (specieId: number) => {
    const [species] = await db
      .select()
      .from(speciesTable)
      .where(eq(speciesTable.id, specieId));
    return species ?? null;
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
};

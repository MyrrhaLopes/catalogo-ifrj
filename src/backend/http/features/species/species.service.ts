import { db } from "@/backend/db/drizzle";
import { speciesTable, type SpeciesTableInsert } from "@/backend/db/schema";
import { SPECIMEN_SERVICE } from "../specimen/specimen.service";

export const SPECIES_SERVICE = {
  registerSpecie: async (specimenId: string, values: SpeciesTableInsert) => {
    const newSpecies = await db.insert(speciesTable).values(values);
    return newSpecies
  },
};

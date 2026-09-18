import { db } from "@/backend/db/drizzle";
import { specimenTable, type SpecimenTableInsert } from "@/backend/db/schema";


export const SPECIMEN_SERVICE = {
  registerSpecimen: async (values:SpecimenTableInsert)=>{
    const newSpecimen = await db.insert(specimenTable).values(values)
    return newSpecimen
  }
}

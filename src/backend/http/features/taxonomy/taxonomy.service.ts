import { db } from "@/backend/db/drizzle";
import { taxonomyTable } from "@/backend/db/schema";

export const TAXONOMY_SERVICE = {
  getAllNodes: async () => {
    return await db
      .select({
        id: taxonomyTable.id,
        label: taxonomyTable.label,
        labelValue: taxonomyTable.labelValue,
        parent: taxonomyTable.parent,
      })
      .from(taxonomyTable);
  },
};

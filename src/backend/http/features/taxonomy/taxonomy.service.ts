import { db } from "@/backend/db/drizzle";
import { taxonomyTable } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

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

  createNode: async (
    label: string,
    labelValue: string,
    parentId: number,
    userId: string,
  ) => {
    const [node] = await db
      .insert(taxonomyTable)
      .values({ label, labelValue, parent: parentId, createdBy: userId })
      .returning({
        id: taxonomyTable.id,
        label: taxonomyTable.label,
        labelValue: taxonomyTable.labelValue,
        parent: taxonomyTable.parent,
      });
    return node;
  },

  updateNodeParent: async (nodeId: number, newParentId: number) => {
    const [node] = await db
      .update(taxonomyTable)
      .set({ parent: newParentId })
      .where(eq(taxonomyTable.id, nodeId))
      .returning({
        id: taxonomyTable.id,
        label: taxonomyTable.label,
        labelValue: taxonomyTable.labelValue,
        parent: taxonomyTable.parent,
      });
    return node;
  },
};

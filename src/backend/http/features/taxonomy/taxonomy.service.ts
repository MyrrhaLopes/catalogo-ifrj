import { db } from "@/backend/db/drizzle";
import { taxonomyTable } from "@/backend/db/schema";
import { eq, sql } from "drizzle-orm";

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
    parentId: number | null,
    userId: string,
  ) => {
    if (parentId === null) {
      // Nó raiz: parent === id, requer CTE para obter o ID antes do insert
      const result = await db.execute(sql`
        WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
        INSERT INTO taxonomies (id, label, label_value, created_by, parent)
        SELECT seq.id, ${label}, ${labelValue}, ${userId}::uuid, seq.id FROM seq
        RETURNING id, label, label_value AS "labelValue", parent
      `);
      return result.rows[0] as { id: number; label: string; labelValue: string; parent: number };
    }
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

  updateNodeLabel: async (nodeId: number, label: string, labelValue: string) => {
    const [node] = await db
      .update(taxonomyTable)
      .set({ label, labelValue })
      .where(eq(taxonomyTable.id, nodeId))
      .returning({
        id: taxonomyTable.id,
        label: taxonomyTable.label,
        labelValue: taxonomyTable.labelValue,
        parent: taxonomyTable.parent,
      });
    return node ?? null;
  },

  deleteNode: async (nodeId: number) => {
    await db.delete(taxonomyTable).where(eq(taxonomyTable.id, nodeId));
  },

  // Retorna true se nodeId é ancestral (direto ou indireto) de targetId, ou se são o mesmo nó.
  // Usado para detectar ciclos antes de reparentar.
  isDescendantOrSelf: async (nodeId: number, targetId: number): Promise<boolean> => {
    const result = await db.execute(sql`
      WITH RECURSIVE ancestors AS (
        SELECT id, parent FROM taxonomies WHERE id = ${targetId}
        UNION ALL
        SELECT t.id, t.parent
        FROM taxonomies t
        JOIN ancestors a ON t.id = a.parent
        WHERE a.id != a.parent
      )
      SELECT id FROM ancestors WHERE id = ${nodeId}
      LIMIT 1
    `);
    return result.rows.length > 0;
  },

  // Retorna as espécies que seriam deletadas em cascata ao remover nodeId (e sua subárvore).
  getAffectedSpecies: async (nodeId: number) => {
    const result = await db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM taxonomies WHERE id = ${nodeId}
        UNION ALL
        SELECT t.id FROM taxonomies t
        JOIN subtree s ON t.parent = s.id
        WHERE t.id != t.parent
      )
      SELECT sp.id, tx.label_value AS "speciesName"
      FROM species sp
      JOIN subtree st ON sp.sepecies = st.id
      JOIN taxonomies tx ON tx.id = sp.sepecies
    `);
    return result.rows as { id: number; speciesName: string }[];
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

import { db } from "@/backend/db/drizzle";
import { attributeTemplateTable, attributeTable } from "@/backend/db/schema";
import { eq, sql } from "drizzle-orm";

export const ATTRIBUTE_TEMPLATES_SERVICE = {
  listAll: async () => {
    return await db
      .select({
        id: attributeTemplateTable.id,
        label: attributeTemplateTable.label,
        unit: attributeTemplateTable.unit,
      })
      .from(attributeTemplateTable)
      .orderBy(attributeTemplateTable.id);
  },

  listDistinctUnits: async (): Promise<string[]> => {
    const rows = await db
      .selectDistinct({ unit: attributeTemplateTable.unit })
      .from(attributeTemplateTable)
      .orderBy(attributeTemplateTable.unit);
    return rows.map((r) => r.unit);
  },

  create: async (label: string, unit: string) => {
    const [template] = await db
      .insert(attributeTemplateTable)
      .values({ label, unit })
      .returning({
        id: attributeTemplateTable.id,
        label: attributeTemplateTable.label,
        unit: attributeTemplateTable.unit,
      });
    return template;
  },

  update: async (
    id: number,
    patch: { label?: string; unit?: string },
  ): Promise<{ id: number; label: string; unit: string } | null> => {
    const [updated] = await db
      .update(attributeTemplateTable)
      .set(patch)
      .where(eq(attributeTemplateTable.id, id))
      .returning({
        id: attributeTemplateTable.id,
        label: attributeTemplateTable.label,
        unit: attributeTemplateTable.unit,
      });
    return updated ?? null;
  },

  delete: async (id: number): Promise<"not_found" | "in_use" | "ok"> => {
    const [inUse] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(attributeTable)
      .where(eq(attributeTable.attribute, id));

    if ((inUse?.count ?? 0) > 0) return "in_use";

    const [deleted] = await db
      .delete(attributeTemplateTable)
      .where(eq(attributeTemplateTable.id, id))
      .returning({ id: attributeTemplateTable.id });

    return deleted ? "ok" : "not_found";
  },
};

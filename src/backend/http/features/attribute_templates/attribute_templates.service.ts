import { db } from "@/backend/db/drizzle";
import { attributeTemplateTable, attributeTable } from "@/backend/db/schema";
import { eq, or, ilike, sql, type SQL } from "drizzle-orm";
import type { AttributeTemplateKind } from "./attribute_templates.schema";

const TEMPLATE_COLUMNS = {
  id: attributeTemplateTable.id,
  label: attributeTemplateTable.label,
  unit: attributeTemplateTable.unit,
  kind: attributeTemplateTable.kind,
  options: attributeTemplateTable.options,
};

export const ATTRIBUTE_TEMPLATES_SERVICE = {
  listAll: async () => {
    return await db.select(TEMPLATE_COLUMNS).from(attributeTemplateTable).orderBy(attributeTemplateTable.id);
  },

  listPaginated: async (params: { page: number; pageSize: number; q?: string }) => {
    const { page, pageSize, q } = params;
    const offset = (page - 1) * pageSize;

    const where: SQL | undefined = q
      ? or(ilike(attributeTemplateTable.label, `%${q}%`), ilike(attributeTemplateTable.unit, `%${q}%`))
      : undefined;

    const [rows, [countRow]] = await Promise.all([
      db
        .select(TEMPLATE_COLUMNS)
        .from(attributeTemplateTable)
        .where(where)
        .orderBy(attributeTemplateTable.id)
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`COUNT(*)::int` }).from(attributeTemplateTable).where(where),
    ]);

    return { templates: rows, total: countRow?.count ?? 0, page, pageSize };
  },

  listDistinctUnits: async (): Promise<string[]> => {
    const rows = await db
      .selectDistinct({ unit: attributeTemplateTable.unit })
      .from(attributeTemplateTable)
      .where(sql`${attributeTemplateTable.unit} <> ''`)
      .orderBy(attributeTemplateTable.unit);
    return rows.map((r) => r.unit);
  },

  create: async (data: { label: string; unit?: string; kind: AttributeTemplateKind; options?: string[] }) => {
    const [template] = await db
      .insert(attributeTemplateTable)
      .values({
        label: data.label,
        unit: data.kind === "categorical" ? "" : (data.unit ?? ""),
        kind: data.kind,
        options: data.kind === "categorical" ? data.options : null,
      })
      .returning(TEMPLATE_COLUMNS);
    return template;
  },

  update: async (
    id: number,
    patch: { label?: string; unit?: string; kind?: AttributeTemplateKind; options?: string[] },
  ) => {
    const values: Partial<typeof attributeTemplateTable.$inferInsert> = { ...patch };
    // Trocar pra numérico limpa opções órfãs; trocar pra categórico limpa a
    // unidade (não faz sentido um atributo categórico ter unidade de medida).
    if (patch.kind === "numeric") values.options = null;
    else if (patch.kind === "categorical") {
      values.options = patch.options;
      values.unit = "";
    }

    const [updated] = await db
      .update(attributeTemplateTable)
      .set(values)
      .where(eq(attributeTemplateTable.id, id))
      .returning(TEMPLATE_COLUMNS);
    return updated ?? null;
  },

  delete: async (id: number): Promise<"not_found" | "ok"> => {
    const [deleted] = await db
      .delete(attributeTemplateTable)
      .where(eq(attributeTemplateTable.id, id))
      .returning({ id: attributeTemplateTable.id });

    return deleted ? "ok" : "not_found";
  },

  getUsageCount: async (id: number): Promise<number> => {
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(attributeTable)
      .where(eq(attributeTable.attribute, id));
    return row?.count ?? 0;
  },
};

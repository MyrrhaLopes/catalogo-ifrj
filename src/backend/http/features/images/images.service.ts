import { db } from "@/backend/db/drizzle";
import { imageTable, articleTable, speciesTable, taxonomyTable } from "@/backend/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

// Alias usado para resolver o nome científico (gênero + epíteto) da espécie
// vinculada à imagem, seguindo a mesma lógica de getScientificName: último nó
// "Espécie" (leafTax) + penúltimo nó (parentTax, geralmente o gênero).
const leafTax = alias(taxonomyTable, "image_search_leaf_tax");
const parentTax = alias(taxonomyTable, "image_search_parent_tax");

const imageWithSpeciesSelect = {
  id: imageTable.id,
  url: imageTable.url,
  alt: imageTable.alt,
  article: imageTable.article,
  type: imageTable.type,
  source: imageTable.source,
  credit: imageTable.credit,
  specimenId: imageTable.specimenId,
  speciesId: articleTable.species,
  createdAt: imageTable.createdAt,
};

export const IMAGES_SERVICE = {
  getBySpecies: async (speciesId: number) => {
    return db
      .select(imageWithSpeciesSelect)
      .from(imageTable)
      .innerJoin(articleTable, eq(imageTable.article, articleTable.id))
      .where(eq(articleTable.species, speciesId));
  },

  getAll: async () => {
    return db
      .select(imageWithSpeciesSelect)
      .from(imageTable)
      .leftJoin(articleTable, eq(imageTable.article, articleTable.id));
  },

  getAllPaginated: async (params: { page: number; pageSize: number; q?: string }) => {
    const { page, pageSize, q } = params;
    const offset = (page - 1) * pageSize;

    const where: SQL | undefined = q
      ? or(
          ilike(imageTable.alt, `%${q}%`),
          ilike(imageTable.url, `%${q}%`),
          ilike(speciesTable.scientificNameOverride, `%${q}%`),
          ilike(leafTax.labelValue, `%${q}%`),
          ilike(parentTax.labelValue, `%${q}%`),
        )
      : undefined;

    const [rows, [countRow]] = await Promise.all([
      db
        .select(imageWithSpeciesSelect)
        .from(imageTable)
        .leftJoin(articleTable, eq(imageTable.article, articleTable.id))
        .leftJoin(speciesTable, eq(articleTable.species, speciesTable.id))
        .leftJoin(leafTax, eq(speciesTable.speciesRoot, leafTax.id))
        .leftJoin(parentTax, eq(leafTax.parent, parentTax.id))
        .where(where)
        .orderBy(desc(imageTable.id))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(DISTINCT ${imageTable.id})::int` })
        .from(imageTable)
        .leftJoin(articleTable, eq(imageTable.article, articleTable.id))
        .leftJoin(speciesTable, eq(articleTable.species, speciesTable.id))
        .leftJoin(leafTax, eq(speciesTable.speciesRoot, leafTax.id))
        .leftJoin(parentTax, eq(leafTax.parent, parentTax.id))
        .where(where),
    ]);

    return { images: rows, total: countRow?.count ?? 0, page, pageSize };
  },

  create: async (data: {
    url: string;
    alt?: string;
    speciesId: number;
    type?: "online" | "acervo";
    source?: string;
    credit?: string;
    specimenId?: number;
  }) => {
    let articleRow = await db
      .select({ id: articleTable.id })
      .from(articleTable)
      .where(eq(articleTable.species, data.speciesId))
      .limit(1);

    if (articleRow.length === 0) {
      const [newArticle] = await db
        .insert(articleTable)
        .values({ species: data.speciesId, content: { sections: {} } })
        .returning({ id: articleTable.id });
      articleRow = [newArticle];
    }

    const [image] = await db
      .insert(imageTable)
      .values({
        url: data.url,
        alt: data.alt,
        article: articleRow[0].id,
        type: data.type ?? "online",
        source: data.source,
        credit: data.credit,
        specimenId: data.specimenId,
      })
      .returning();

    return image;
  },

  update: async (id: number, data: {
    url?: string;
    alt?: string | null;
    type?: "online" | "acervo";
    source?: string | null;
    credit?: string | null;
    specimenId?: number | null;
  }) => {
    const [updated] = await db
      .update(imageTable)
      .set(data)
      .where(eq(imageTable.id, id))
      .returning();
    return updated ?? null;
  },

  delete: async (id: number) => {
    const [deleted] = await db
      .delete(imageTable)
      .where(eq(imageTable.id, id))
      .returning({ url: imageTable.url });
    return deleted ?? null;
  },
};

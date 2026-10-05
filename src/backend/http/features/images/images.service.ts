import { db } from "@/backend/db/drizzle";
import { imageTable, articleTable, speciesTable } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

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
    await db.delete(imageTable).where(eq(imageTable.id, id));
  },
};

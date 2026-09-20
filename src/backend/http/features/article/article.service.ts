import { db } from "@/backend/db/drizzle";
import { articleTable, articleRecordTable, imageTable } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import type { ArticleContent } from "./article.schema";

export const ARTICLE_SERVICE = {
  getBySpecies: async (speciesId: number) => {
    const [article] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.species, speciesId));

    const images = article
      ? await db.select().from(imageTable).where(eq(imageTable.article, article.id))
      : [];

    return { article: article ?? null, images };
  },

  create: async (speciesId: number, content: ArticleContent) => {
    const [article] = await db
      .insert(articleTable)
      .values({ species: speciesId, content })
      .returning();
    return article;
  },

  update: async (articleId: number, content: ArticleContent, editedBy: string) => {
    const [current] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, articleId));

    if (current) {
      await db.insert(articleRecordTable).values({
        content: current.content,
        species: current.species,
        edited_by: editedBy,
      });
    }

    const [updated] = await db
      .update(articleTable)
      .set({ content })
      .where(eq(articleTable.id, articleId))
      .returning();

    return updated ?? null;
  },
};

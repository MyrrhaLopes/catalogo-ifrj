import { db } from "@/backend/db/drizzle";
import {
  articleTable,
  articleRecordTable,
  imageTable,
  sourceTable,
  articleSourcesPivotTable,
} from "@/backend/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { ArticleContent } from "./article.schema";

const CITE_RE = /\[cite:(\d+)\]/g;

function flattenSectionBlocks(
  section: ArticleContent["sections"][keyof ArticleContent["sections"]],
) {
  if (!section) return [];
  return section.flatMap((item) => {
    if (typeof item !== "object") return [];
    return item.type === "column" ? item.columns.flat() : [item];
  });
}

function extractBlockTexts(content: ArticleContent): string[] {
  return Object.values(content.sections)
    .flatMap(flattenSectionBlocks)
    .filter((block) => block.type === "text")
    .map((block) => block.content);
}

export function extractSourceIds(content: ArticleContent): number[] {
  const ids = extractBlockTexts(content).flatMap((text) =>
    Array.from(text.matchAll(CITE_RE), (m) => Number(m[1])),
  );
  return [...new Set(ids)];
}

async function syncPivot(articleId: number, sourceIds: number[]) {
  await db
    .delete(articleSourcesPivotTable)
    .where(eq(articleSourcesPivotTable.articleId, articleId));

  if (sourceIds.length > 0) {
    await db.insert(articleSourcesPivotTable).values(
      sourceIds.map((sourceId) => ({ articleId, sourceId })),
    );
  }
}

async function fetchSources(articleId: number) {
  const rows = await db
    .select({ id: sourceTable.id, url: sourceTable.url })
    .from(articleSourcesPivotTable)
    .innerJoin(sourceTable, eq(articleSourcesPivotTable.sourceId, sourceTable.id))
    .where(eq(articleSourcesPivotTable.articleId, articleId));
  return rows;
}

async function buildArticleResponse(article: typeof articleTable.$inferSelect | undefined) {
  if (!article) return { article: null, images: [], sources: [] };

  const [imageRows, sources] = await Promise.all([
    db.select().from(imageTable).where(eq(imageTable.article, article.id)),
    fetchSources(article.id),
  ]);

  const images = imageRows.map((img) => ({ ...img, speciesId: article.species }));
  return { article, images, sources };
}

export const ARTICLE_SERVICE = {
  getById: async (articleId: number) => {
    const [article] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, articleId));
    return buildArticleResponse(article);
  },

  getBySpecies: async (speciesId: number) => {
    const [article] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.species, speciesId));
    return buildArticleResponse(article);
  },

  create: async (speciesId: number, content: ArticleContent) => {
    const [article] = await db
      .insert(articleTable)
      .values({ species: speciesId, content })
      .returning();

    const sourceIds = extractSourceIds(content);
    await syncPivot(article.id, sourceIds);

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

    if (updated) {
      const sourceIds = extractSourceIds(content);
      await syncPivot(updated.id, sourceIds);
    }

    return updated ?? null;
  },

  getSourcesByIds: async (ids: number[]) => {
    if (ids.length === 0) return [];
    return await db
      .select({ id: sourceTable.id, url: sourceTable.url })
      .from(sourceTable)
      .where(inArray(sourceTable.id, ids));
  },
};

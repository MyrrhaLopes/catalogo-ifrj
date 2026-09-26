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

function extractSourceIds(content: ArticleContent): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  const sections = Object.values(content.sections);
  for (const section of sections) {
    if (!section) continue;
    for (const item of section) {
      if (typeof item !== "object") continue;
      const blocks = item.type === "column"
        ? item.columns.flat()
        : [item];
      for (const block of blocks) {
        if (block.type !== "text") continue;
        CITE_RE.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = CITE_RE.exec(block.content)) !== null) {
          const id = Number(match[1]);
          if (!seen.has(id)) {
            seen.add(id);
            ordered.push(id);
          }
        }
      }
    }
  }
  return ordered;
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


export const ARTICLE_SERVICE = {
  getById: async (articleId: number) => {
    const [article] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, articleId));

    if (!article) return { article: null, images: [], sources: [] };

    const [images, sources] = await Promise.all([
      db.select().from(imageTable).where(eq(imageTable.article, article.id)),
      fetchSources(article.id),
    ]);

    return { article, images, sources };
  },

  getBySpecies: async (speciesId: number) => {
    const [article] = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.species, speciesId));

    if (!article) return { article: null, images: [], sources: [] };

    const [images, sources] = await Promise.all([
      db.select().from(imageTable).where(eq(imageTable.article, article.id)),
      fetchSources(article.id),
    ]);

    return { article, images, sources };
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

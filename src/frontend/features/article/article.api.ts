import type {
  ArticleContent,
  Article,
  ArticleSource,
} from "@/backend/http/features/article/article.schema";
import { apiFetch } from "@/frontend/shared/api/client";

export type { ArticleContent, Article, ArticleSource };

export async function createArticle(
  speciesId: number,
  content: ArticleContent,
  deletedImageUrls?: string[],
): Promise<Article> {
  const res = await apiFetch(`/api/v1/articles/`, {
    method: "POST",
    body: JSON.stringify({ speciesId, ...content, deletedImageUrls }),
  });
  const { article } = (await res.json()) as { article: Article };
  return article;
}

export async function updateArticle(
  articleId: number,
  content: ArticleContent,
  deletedImageUrls?: string[],
): Promise<Article> {
  const res = await apiFetch(`/api/v1/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify({ ...content, deletedImageUrls }),
  });
  const { article } = (await res.json()) as { article: Article };
  return article;
}

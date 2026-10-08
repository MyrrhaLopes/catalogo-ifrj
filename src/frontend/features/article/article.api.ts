import { articleWithImagesSchema } from "@/backend/http/features/article/article.schema";
import type {
  ArticleContent,
  Article,
  ArticleImage,
  ArticleWithImages,
  ArticleSource,
} from "@/backend/http/features/article/article.schema";
import { apiFetch, ApiError } from "@/frontend/shared/api/client";

export type { ArticleContent, Article, ArticleImage, ArticleWithImages, ArticleSource };

export async function getArticleBySpecies(speciesId: number): Promise<ArticleWithImages> {
  try {
    const res = await apiFetch(`/api/v1/articles/?speciesId=${speciesId}`);
    return articleWithImagesSchema.parse(await res.json());
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw new Error("Artigo não encontrado");
    throw e;
  }
}

export async function createArticle(
  speciesId: number,
  content: ArticleContent,
): Promise<Article> {
  const res = await apiFetch(`/api/v1/articles/`, {
    method: "POST",
    body: JSON.stringify({ speciesId, ...content }),
  });
  const { article } = await res.json() as { article: Article };
  return article;
}

export async function updateArticle(
  articleId: number,
  content: ArticleContent,
): Promise<Article> {
  const res = await apiFetch(`/api/v1/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify(content),
  });
  const { article } = await res.json() as { article: Article };
  return article;
}

import { articleWithImagesSchema } from "@/backend/http/features/article/article.schema";
import type {
  ArticleContent,
  Article,
  ArticleImage,
  ArticleWithImages,
  ArticleSource,
} from "@/backend/http/features/article/article.schema";

export type { ArticleContent, Article, ArticleImage, ArticleWithImages, ArticleSource };

export async function getArticleBySpecies(speciesId: number): Promise<ArticleWithImages> {
  const res = await fetch(`/api/v1/articles/?speciesId=${speciesId}`);
  if (res.status === 404) throw new Error("Artigo não encontrado");
  if (!res.ok) throw new Error("Erro ao buscar artigo");
  return articleWithImagesSchema.parse(await res.json());
}

export async function createArticle(
  speciesId: number,
  content: ArticleContent,
): Promise<Article> {
  const res = await fetch(`/api/v1/articles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ speciesId, ...content }),
  });
  if (!res.ok) throw new Error("Erro ao criar artigo");
  const { article } = await res.json() as { article: Article };
  return article;
}

export async function updateArticle(
  articleId: number,
  content: ArticleContent,
): Promise<Article> {
  const res = await fetch(`/api/v1/articles/${articleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error("Erro ao atualizar artigo");
  const { article } = await res.json() as { article: Article };
  return article;
}

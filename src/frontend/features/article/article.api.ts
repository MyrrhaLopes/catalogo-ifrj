export type ArticleSection = {
  id: string;
  title: string;
  content: string;
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type ArticleContent = {
  sections: ArticleSection[];
  sources?: ArticleSource[];
};

export type Article = {
  id: number;
  content: ArticleContent;
  species: number;
  createdAt: string;
};

export type ArticleImage = {
  id: number;
  url: string;
  alt: string | null;
  article: number | null;
};

export type ArticleWithImages = {
  article: Article;
  images: ArticleImage[];
};

export async function getArticleBySpecies(speciesId: number): Promise<ArticleWithImages> {
  const res = await fetch(`/api/v1/species/${speciesId}/article`);
  if (res.status === 404) throw new Error("Artigo não encontrado");
  if (!res.ok) throw new Error("Erro ao buscar artigo");
  return res.json() as Promise<ArticleWithImages>;
}

export async function createArticle(
  speciesId: number,
  content: ArticleContent,
): Promise<Article> {
  const res = await fetch(`/api/v1/species/${speciesId}/article`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error("Erro ao criar artigo");
  const data = await res.json() as { article: Article };
  return data.article;
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
  const data = await res.json() as { article: Article };
  return data.article;
}

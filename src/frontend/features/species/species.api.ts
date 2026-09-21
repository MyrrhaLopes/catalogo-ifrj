import {
  speciesListResponseSchema,
  speciesResponseSchema,
} from "@/backend/http/features/species/species.schema";
import type { SpeciesBase, SpeciesWithTaxonomy } from "@/backend/http/features/species/species.schema";
import { articleWithImagesSchema } from "@/backend/http/features/article/article.schema";
import type { Article, ArticleImage } from "@/backend/http/features/article/article.schema";

export type { SpeciesBase, SpeciesWithTaxonomy };

export type SpeciesDetails = SpeciesWithTaxonomy & {
  article: Article | null;
  images: ArticleImage[];
};

export async function getSpeciesDetails(id: number): Promise<SpeciesDetails> {
  const [speciesRes, articleRes] = await Promise.all([
    fetch(`/api/v1/species/${id}?withTaxonomy=true`),
    fetch(`/api/v1/articles/?speciesId=${id}`),
  ]);

  if (speciesRes.status === 404) throw new Error("Espécie não encontrada");
  if (!speciesRes.ok) throw new Error("Erro ao buscar detalhes da espécie");
  if (!articleRes.ok && articleRes.status !== 404) throw new Error("Erro ao buscar artigo");

  const { species } = speciesResponseSchema.parse(await speciesRes.json());

  if (articleRes.status === 404) {
    return { ...species, article: null, images: [] };
  }

  const { article, images } = articleWithImagesSchema.parse(await articleRes.json());
  return { ...species, article, images };
}

export async function getSpeciesList(): Promise<SpeciesBase[]> {
  const res = await fetch("/api/v1/species/");
  if (!res.ok) throw new Error("Erro ao buscar espécies");
  const { species } = speciesListResponseSchema.parse(await res.json());
  return species;
}

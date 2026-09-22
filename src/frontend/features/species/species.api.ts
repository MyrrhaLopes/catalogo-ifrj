import {
  speciesResponseSchema,
  searchResponseSchema,
} from "@/backend/http/features/species/species.schema";
import type {
  SpeciesBase,
  SpeciesWithTaxonomy,
  SearchResponse,
  SpeciesSearchResult,
  AttributeTemplate,
} from "@/backend/http/features/species/species.schema";
import { taxonomyListResponseSchema } from "@/backend/http/features/taxonomy/taxonomy.schema";
import type { TaxonomyNode } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { articleWithImagesSchema } from "@/backend/http/features/article/article.schema";
import type {
  Article,
  ArticleImage,
} from "@/backend/http/features/article/article.schema";

export type { SpeciesBase, SpeciesWithTaxonomy, SearchResponse, SpeciesSearchResult, AttributeTemplate, TaxonomyNode };

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
  if (!articleRes.ok && articleRes.status !== 404)
    throw new Error("Erro ao buscar artigo");

  const { species } = speciesResponseSchema.parse(await speciesRes.json());

  if (articleRes.status === 404) {
    return { ...species, article: null, images: [] };
  }

  const { article, images } = articleWithImagesSchema.parse(
    await articleRes.json(),
  );
  return { ...species, article, images };
}

export type SearchParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  taxNodes?: number[];
  attrs?: Array<{ templateId: number; valueInBaseUnit: number }>;
};

export async function searchSpecies(params: SearchParams): Promise<SearchResponse> {
  const url = new URL("/api/v1/species/", window.location.origin);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));
  if (params.taxNodes?.length) url.searchParams.set("taxNodes", params.taxNodes.join(","));
  if (params.attrs?.length) url.searchParams.set("attrs", JSON.stringify(params.attrs));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Erro ao buscar espécies");
  return searchResponseSchema.parse(await res.json());
}

export async function getTaxonomy(): Promise<TaxonomyNode[]> {
  const res = await fetch("/api/v1/taxonomy/");
  if (!res.ok) throw new Error("Erro ao buscar taxonomia");
  const { nodes } = taxonomyListResponseSchema.parse(await res.json());
  return nodes;
}

export async function getAttributeTemplates(): Promise<AttributeTemplate[]> {
  const res = await fetch("/api/v1/species/attribute-templates");
  if (!res.ok) throw new Error("Erro ao buscar templates de atributos");
  const data = await res.json();
  return data.templates as AttributeTemplate[];
}

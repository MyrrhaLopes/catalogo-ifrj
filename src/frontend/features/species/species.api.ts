import {
  speciesResponseSchema,
  searchResponseSchema,
  attributeTemplateSchema,
} from "@/backend/http/features/species/species.schema";
import type {
  SpeciesBase,
  SpeciesWithTaxonomy,
  SearchResponse,
  SpeciesSearchResult,
  AttributeTemplate,
} from "@/backend/http/features/species/species.schema";
import { z } from "zod";
import { taxonomyListResponseSchema } from "@/backend/http/features/taxonomy/taxonomy.schema";
import type { TaxonomyNode } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { articleWithImagesSchema } from "@/backend/http/features/article/article.schema";
import type {
  Article,
  ArticleSource,
} from "@/backend/http/features/article/article.schema";
import { getImagesBySpecies } from "@/frontend/features/images/images.api";
import type { GalleryImage } from "@/frontend/features/images/images.api";
import { apiFetch, ApiError } from "@/frontend/shared/api/client";

export type { SpeciesBase, SpeciesWithTaxonomy, SearchResponse, SpeciesSearchResult, AttributeTemplate, TaxonomyNode, GalleryImage };
export { setSpeciesThumbnail } from "@/frontend/features/images/images.api";

export type SpeciesDetails = Omit<SpeciesWithTaxonomy, "thumbnailImage"> & {
  article: Article | null;
  images: GalleryImage[];
  thumbnailImage: GalleryImage | null;
  sources: ArticleSource[];
};

export async function getSpeciesDetails(id: number): Promise<SpeciesDetails> {
  let speciesRes: Response;
  try {
    speciesRes = await apiFetch(`/api/v1/species/${id}?withTaxonomy=true`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw new Error("Espécie não encontrada");
    throw e;
  }

  const articleRes = await fetch(`/api/v1/articles/?speciesId=${id}`);
  const galleryImages = await getImagesBySpecies(id).catch(() => []);

  if (!articleRes.ok && articleRes.status !== 404)
    throw new Error("Erro ao buscar artigo");

  const { species } = speciesResponseSchema.parse(await speciesRes.json());
  const thumbnailImage = species.thumbnailImage ?? null;

  if (articleRes.status === 404) {
    return { ...species, article: null, images: galleryImages, thumbnailImage, sources: [] };
  }

  const { article, sources } = articleWithImagesSchema.parse(await articleRes.json());
  return { ...species, article, images: galleryImages, thumbnailImage, sources };
}

export type SearchParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  taxNodes?: number[];
  attrs?: Array<{ templateId: number; valueInBaseUnit: number; operator?: "=" | ">" | "<" }>;
};

export async function searchSpecies(params: SearchParams): Promise<SearchResponse> {
  const url = new URL("/api/v1/species/", window.location.origin);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));
  if (params.taxNodes?.length) url.searchParams.set("taxNodes", params.taxNodes.join(","));
  if (params.attrs?.length) url.searchParams.set("attrs", JSON.stringify(params.attrs));

  const res = await apiFetch(url.toString());
  return searchResponseSchema.parse(await res.json());
}

export async function getTaxonomy(): Promise<TaxonomyNode[]> {
  const res = await apiFetch("/api/v1/taxonomy/");
  const { nodes } = taxonomyListResponseSchema.parse(await res.json());
  return nodes;
}

export async function getAttributeTemplates(): Promise<AttributeTemplate[]> {
  const res = await apiFetch("/api/v1/attribute-templates");
  const { templates } = z.object({ templates: z.array(attributeTemplateSchema) }).parse(await res.json());
  return templates;
}

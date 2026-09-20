import type { ArticleContent, ArticleImage } from "@/frontend/features/article/article.api";

export type TaxonomyNode = {
  id: number;
  label: string;
  labelValue: string;
};

export type PopularName = {
  id: number;
  name: string;
  origin: string | null;
};

export type SpeciesAttribute = {
  label: string;
  value: string;
  unit: "meter" | "minute";
};

export type SpeciesDetails = {
  id: number;
  speciesRoot: number;
  taxonomyPath: TaxonomyNode[];
  popularNames: PopularName[];
  article: {
    id: number;
    content: ArticleContent;
    species: number;
    createdAt: string;
  } | null;
  images: ArticleImage[];
  attributes: SpeciesAttribute[];
};

export type SpeciesSummary = {
  id: number;
  speciesRoot: number;
  createdAt: string | null;
};

export async function getSpeciesDetails(id: number): Promise<SpeciesDetails> {
  const res = await fetch(`/api/v1/species/${id}/details`);
  if (res.status === 404) throw new Error("Espécie não encontrada");
  if (!res.ok) throw new Error("Erro ao buscar detalhes da espécie");
  const data = await res.json() as { details: SpeciesDetails };
  return data.details;
}

export async function getSpeciesList(): Promise<SpeciesSummary[]> {
  const res = await fetch("/api/v1/species/");
  if (!res.ok) throw new Error("Erro ao buscar espécies");
  const data = await res.json() as { species: SpeciesSummary[] };
  return data.species;
}

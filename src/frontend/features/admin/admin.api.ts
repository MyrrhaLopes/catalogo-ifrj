import type { SpeciesBase, SpeciesDeleteImpact } from "@/backend/http/features/species/species.schema";
import type { TaxonomyNode, AffectedSpeciesItem } from "@/backend/http/features/taxonomy/taxonomy.schema";
import type { UserListItem } from "@/backend/http/features/users/user.schema";
import type { AttributeTemplateDeleteImpact } from "@/backend/http/features/attribute_templates/attribute_templates.schema";
import { speciesBaseSchema, speciesDeleteImpactSchema } from "@/backend/http/features/species/species.schema";
import { taxonomyNodeSchema, affectedSpeciesItemSchema } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { userListResponseSchema } from "@/backend/http/features/users/user.schema";
import {
  attributeTemplateDeleteImpactSchema,
  attributeTemplatePaginatedResponseSchema,
} from "@/backend/http/features/attribute_templates/attribute_templates.schema";
import { z } from "zod";
import { apiFetch } from "@/frontend/shared/api/client";

export type { SpeciesDeleteImpact, AttributeTemplateDeleteImpact };

export type { AffectedSpeciesItem };

export type { UserListItem };

export type UserListResponse = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getUsers(page: number, pageSize: number): Promise<UserListResponse> {
  const res = await apiFetch(`/api/v1/users/?page=${page}&pageSize=${pageSize}`);
  return userListResponseSchema.parse(await res.json());
}

export async function createSpecies(speciesRoot: number): Promise<SpeciesBase> {
  const res = await apiFetch("/api/v1/species/", {
    method: "POST",
    body: JSON.stringify({ speciesRoot }),
  });
  const { species } = z.object({ species: speciesBaseSchema }).parse(await res.json());
  return species;
}

export async function deleteSpecies(id: number): Promise<void> {
  await apiFetch(`/api/v1/species/${id}`, { method: "DELETE" });
}

export async function getSpeciesDeleteImpact(id: number): Promise<SpeciesDeleteImpact> {
  const res = await apiFetch(`/api/v1/species/${id}/delete-impact`);
  const { impact } = z.object({ impact: speciesDeleteImpactSchema }).parse(await res.json());
  return impact;
}

export async function createTaxonomyNode(
  label: string,
  labelValue: string,
  parentId: number | null,
): Promise<TaxonomyNode> {
  const res = await apiFetch("/api/v1/taxonomy/", {
    method: "POST",
    body: JSON.stringify({ label, labelValue, parentId }),
  });
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function updateTaxonomyNodeParent(
  nodeId: number,
  newParentId: number,
): Promise<TaxonomyNode> {
  const res = await apiFetch(`/api/v1/taxonomy/${nodeId}`, {
    method: "PATCH",
    body: JSON.stringify({ parentId: newParentId }),
  });
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function updateTaxonomyNodeLabel(
  nodeId: number,
  label: string,
  labelValue: string,
): Promise<TaxonomyNode> {
  const res = await apiFetch(`/api/v1/taxonomy/${nodeId}`, {
    method: "PUT",
    body: JSON.stringify({ label, labelValue }),
  });
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function deleteTaxonomyNode(nodeId: number): Promise<void> {
  await apiFetch(`/api/v1/taxonomy/${nodeId}`, { method: "DELETE" });
}

export async function getTaxonomyAffectedSpecies(nodeId: number): Promise<AffectedSpeciesItem[]> {
  const res = await apiFetch(`/api/v1/taxonomy/${nodeId}/affected-species`);
  const { species } = z.object({ species: z.array(affectedSpeciesItemSchema) }).parse(await res.json());
  return species;
}

export type AttributeTemplateItem = { id: number; label: string; unit: string };

const attributeTemplateResponseSchema = z.object({
  template: z.object({ id: z.number(), label: z.string(), unit: z.string() }),
});

async function parseAttributeTemplateResponse(res: Response): Promise<AttributeTemplateItem> {
  const { template } = attributeTemplateResponseSchema.parse(await res.json());
  return template;
}

export async function getDistinctUnits(): Promise<string[]> {
  const res = await apiFetch("/api/v1/attribute-templates/units");
  const { units } = z.object({ units: z.array(z.string()) }).parse(await res.json());
  return units;
}

export type AttributeTemplatePaginatedResponse = {
  templates: AttributeTemplateItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getAttributeTemplatesPaginated(
  page: number,
  pageSize: number,
  q?: string,
): Promise<AttributeTemplatePaginatedResponse> {
  const url = new URL("/api/v1/attribute-templates", window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (q) url.searchParams.set("q", q);
  const res = await apiFetch(url.toString());
  return attributeTemplatePaginatedResponseSchema.parse(await res.json());
}

export async function createAttributeTemplate(
  data: { label: string; unit: string },
): Promise<AttributeTemplateItem> {
  const res = await apiFetch("/api/v1/attribute-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseAttributeTemplateResponse(res);
}

export async function deleteAttributeTemplate(id: number): Promise<void> {
  await apiFetch(`/api/v1/attribute-templates/${id}`, { method: "DELETE" });
}

export async function getAttributeTemplateDeleteImpact(id: number): Promise<AttributeTemplateDeleteImpact> {
  const res = await apiFetch(`/api/v1/attribute-templates/${id}/delete-impact`);
  const { impact } = z.object({ impact: attributeTemplateDeleteImpactSchema }).parse(await res.json());
  return impact;
}

export async function updateAttributeTemplate(
  id: number,
  patch: { label?: string; unit?: string },
): Promise<AttributeTemplateItem> {
  const res = await apiFetch(`/api/v1/attribute-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return parseAttributeTemplateResponse(res);
}

export async function updateSpeciesAttributes(
  speciesId: number,
  attributes: Array<{ templateId: number; value: string; sourceUrl?: string | null }>,
): Promise<void> {
  await apiFetch(`/api/v1/species/${speciesId}/attributes`, {
    method: "PUT",
    body: JSON.stringify({ attributes }),
  });
}

export async function updateSpeciesScientificName(
  speciesId: number,
  scientificName: string | null,
): Promise<void> {
  await apiFetch(`/api/v1/species/${speciesId}/scientific-name`, {
    method: "PATCH",
    body: JSON.stringify({ scientificName }),
  });
}

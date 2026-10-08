import type { SpeciesBase } from "@/backend/http/features/species/species.schema";
import type { TaxonomyNode, AffectedSpeciesItem } from "@/backend/http/features/taxonomy/taxonomy.schema";
import type { UserListItem } from "@/backend/http/features/users/user.schema";
import { speciesBaseSchema } from "@/backend/http/features/species/species.schema";
import { taxonomyNodeSchema, affectedSpeciesItemSchema } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { userListItemSchema } from "@/backend/http/features/users/user.schema";
import { z } from "zod";
import { apiFetch, ApiError } from "@/frontend/shared/api/client";

export type { AffectedSpeciesItem };

export type { UserListItem };

export async function getUsers(): Promise<UserListItem[]> {
  const res = await apiFetch("/api/v1/users/");
  const { users } = z.object({ users: z.array(userListItemSchema) }).parse(await res.json());
  return users;
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

export async function getDistinctUnits(): Promise<string[]> {
  const res = await apiFetch("/api/v1/attribute-templates/units");
  const { units } = z.object({ units: z.array(z.string()) }).parse(await res.json());
  return units;
}

export async function createAttributeTemplate(
  data: { label: string; unit: string },
): Promise<AttributeTemplateItem> {
  const res = await apiFetch("/api/v1/attribute-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const { template } = z
    .object({ template: z.object({ id: z.number(), label: z.string(), unit: z.string() }) })
    .parse(await res.json());
  return template;
}

export async function deleteAttributeTemplate(id: number): Promise<void> {
  try {
    await apiFetch(`/api/v1/attribute-templates/${id}`, { method: "DELETE" });
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      const body = (await e.response.json()) as { message: string };
      throw new Error(body.message);
    }
    throw e;
  }
}

export async function updateAttributeTemplate(
  id: number,
  patch: { label?: string; unit?: string },
): Promise<AttributeTemplateItem> {
  const res = await apiFetch(`/api/v1/attribute-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const { template } = z
    .object({ template: z.object({ id: z.number(), label: z.string(), unit: z.string() }) })
    .parse(await res.json());
  return template;
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

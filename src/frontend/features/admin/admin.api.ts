import type { SpeciesBase } from "@/backend/http/features/species/species.schema";
import type { TaxonomyNode, AffectedSpeciesItem } from "@/backend/http/features/taxonomy/taxonomy.schema";
import type { UserListItem } from "@/backend/http/features/users/user.schema";
import { speciesBaseSchema } from "@/backend/http/features/species/species.schema";
import { taxonomyNodeSchema, affectedSpeciesItemSchema } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { userListItemSchema } from "@/backend/http/features/users/user.schema";
import { z } from "zod";

export type { AffectedSpeciesItem };

export type { UserListItem };

export async function getUsers(): Promise<UserListItem[]> {
  const res = await fetch("/api/v1/users/", { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  const { users } = z.object({ users: z.array(userListItemSchema) }).parse(await res.json());
  return users;
}

export async function createSpecies(speciesRoot: number): Promise<SpeciesBase> {
  const res = await fetch("/api/v1/species/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ speciesRoot }),
  });
  if (!res.ok) throw new Error("Erro ao criar espécie");
  const { species } = z.object({ species: speciesBaseSchema }).parse(await res.json());
  return species;
}

export async function deleteSpecies(id: number): Promise<void> {
  const res = await fetch(`/api/v1/species/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao deletar espécie");
}

export async function createTaxonomyNode(
  label: string,
  labelValue: string,
  parentId: number | null,
): Promise<TaxonomyNode> {
  const res = await fetch("/api/v1/taxonomy/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ label, labelValue, parentId }),
  });
  if (!res.ok) throw new Error("Erro ao criar nó taxonômico");
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function updateTaxonomyNodeParent(
  nodeId: number,
  newParentId: number,
): Promise<TaxonomyNode> {
  const res = await fetch(`/api/v1/taxonomy/${nodeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ parentId: newParentId }),
  });
  if (!res.ok) throw new Error("Erro ao mover nó taxonômico");
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function updateTaxonomyNodeLabel(
  nodeId: number,
  label: string,
  labelValue: string,
): Promise<TaxonomyNode> {
  const res = await fetch(`/api/v1/taxonomy/${nodeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ label, labelValue }),
  });
  if (!res.ok) throw new Error("Erro ao editar nó taxonômico");
  const { node } = z.object({ node: taxonomyNodeSchema }).parse(await res.json());
  return node;
}

export async function deleteTaxonomyNode(nodeId: number): Promise<void> {
  const res = await fetch(`/api/v1/taxonomy/${nodeId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao excluir nó taxonômico");
}

export async function getTaxonomyAffectedSpecies(nodeId: number): Promise<AffectedSpeciesItem[]> {
  const res = await fetch(`/api/v1/taxonomy/${nodeId}/affected-species`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao verificar espécies afetadas");
  const { species } = z.object({ species: z.array(affectedSpeciesItemSchema) }).parse(await res.json());
  return species;
}

export type AttributeTemplateItem = { id: number; label: string; unit: string };

export async function getDistinctUnits(): Promise<string[]> {
  const res = await fetch("/api/v1/attribute-templates/units");
  if (!res.ok) throw new Error("Erro ao buscar unidades");
  const { units } = z.object({ units: z.array(z.string()) }).parse(await res.json());
  return units;
}

export async function createAttributeTemplate(
  data: { label: string; unit: string },
): Promise<AttributeTemplateItem> {
  const res = await fetch("/api/v1/attribute-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar template de atributo");
  const { template } = z
    .object({ template: z.object({ id: z.number(), label: z.string(), unit: z.string() }) })
    .parse(await res.json());
  return template;
}

export async function deleteAttributeTemplate(id: number): Promise<void> {
  const res = await fetch(`/api/v1/attribute-templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 409) {
    const body = (await res.json()) as { message: string };
    throw new Error(body.message);
  }
  if (!res.ok) throw new Error("Erro ao excluir template de atributo");
}

export async function updateAttributeTemplate(
  id: number,
  patch: { label?: string; unit?: string },
): Promise<AttributeTemplateItem> {
  const res = await fetch(`/api/v1/attribute-templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Erro ao editar template de atributo");
  const { template } = z
    .object({ template: z.object({ id: z.number(), label: z.string(), unit: z.string() }) })
    .parse(await res.json());
  return template;
}

export async function updateSpeciesAttributes(
  speciesId: number,
  attributes: Array<{ templateId: number; value: string }>,
): Promise<void> {
  const res = await fetch(`/api/v1/species/${speciesId}/attributes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ attributes }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar atributos da espécie");
}

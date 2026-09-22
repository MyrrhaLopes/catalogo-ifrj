import { specimenListResponseSchema } from "@/backend/http/features/specimen/specimen.schema";
import type { Specimen } from "@/backend/http/features/specimen/specimen.schema";

export type { Specimen };

export type SpecimenSearchResponse = {
  specimens: Specimen[];
  total: number;
};

export async function searchSpecimens(q: string): Promise<SpecimenSearchResponse> {
  const url = new URL("/api/v1/specimens/", window.location.origin);
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Erro ao buscar espécimes");
  return specimenListResponseSchema.parse(await res.json());
}

export async function listSpecimens(): Promise<SpecimenSearchResponse> {
  const res = await fetch("/api/v1/specimens/");
  if (!res.ok) throw new Error("Erro ao buscar espécimes");
  return specimenListResponseSchema.parse(await res.json());
}

export async function createSpecimen(data: {
  code: string;
  lot?: number;
  shelf?: number;
}): Promise<Specimen> {
  const res = await fetch("/api/v1/specimens/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar espécime");
  const { specimen } = await res.json();
  return specimen as Specimen;
}

export async function updateSpecimen(
  id: number,
  patch: { code?: string; lot?: number | null; shelf?: number | null },
): Promise<Specimen> {
  const res = await fetch(`/api/v1/specimens/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Erro ao atualizar espécime");
  const { specimen } = await res.json();
  return specimen as Specimen;
}

export async function deleteSpecimen(id: number): Promise<void> {
  const res = await fetch(`/api/v1/specimens/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao excluir espécime");
}

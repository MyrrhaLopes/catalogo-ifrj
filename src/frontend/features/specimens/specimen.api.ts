import { specimenListResponseSchema } from "@/backend/http/features/specimen/specimen.schema";
import type { Specimen } from "@/backend/http/features/specimen/specimen.schema";
import { apiFetch } from "@/frontend/shared/api/client";

export type { Specimen };

export type SpecimenSearchResponse = {
  specimens: Specimen[];
  total: number;
};

export async function searchSpecimens(q: string): Promise<SpecimenSearchResponse> {
  const url = new URL("/api/v1/specimens/", window.location.origin);
  if (q) url.searchParams.set("q", q);
  const res = await apiFetch(url.toString());
  return specimenListResponseSchema.parse(await res.json());
}

export async function listSpecimens(): Promise<SpecimenSearchResponse> {
  const res = await apiFetch("/api/v1/specimens/");
  return specimenListResponseSchema.parse(await res.json());
}

export async function createSpecimen(data: {
  code: string;
  lot?: number;
  shelf?: number;
}): Promise<Specimen> {
  const res = await apiFetch("/api/v1/specimens/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const { specimen } = await res.json();
  return specimen as Specimen;
}

export async function updateSpecimen(
  id: number,
  patch: { code?: string; lot?: number | null; shelf?: number | null; speciesId?: number | null },
): Promise<Specimen> {
  const res = await apiFetch(`/api/v1/specimens/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const { specimen } = await res.json();
  return specimen as Specimen;
}

export async function deleteSpecimen(id: number): Promise<void> {
  await apiFetch(`/api/v1/specimens/${id}`, { method: "DELETE" });
}

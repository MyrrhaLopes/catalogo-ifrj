import { z } from "zod";
import { apiFetch } from "@/frontend/shared/api/client";

export const galleryImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  alt: z.string().nullable(),
  article: z.number().nullable(),
  type: z.enum(["online", "acervo"]).default("online"),
  source: z.string().nullable(),
  credit: z.string().nullable(),
  specimenId: z.number().nullable(),
  speciesId: z.number().nullable(),
  createdAt: z.string(),
});
export type GalleryImage = z.infer<typeof galleryImageSchema>;

const imagesResponseSchema = z.object({
  images: z.array(galleryImageSchema),
});

export async function getImagesBySpecies(speciesId: number): Promise<GalleryImage[]> {
  const res = await apiFetch(`/api/v1/images?speciesId=${speciesId}`);
  return imagesResponseSchema.parse(await res.json()).images;
}

export async function getAllImages(): Promise<GalleryImage[]> {
  const res = await apiFetch("/api/v1/images");
  return imagesResponseSchema.parse(await res.json()).images;
}

export async function createImage(data: {
  url: string;
  alt?: string;
  speciesId: number;
  type?: "online" | "acervo";
  source?: string;
  credit?: string;
  specimenId?: number;
}): Promise<GalleryImage> {
  const res = await apiFetch("/api/v1/images", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const { image } = (await res.json()) as { image: GalleryImage };
  return image;
}

export async function updateImage(
  id: number,
  data: {
    url?: string;
    alt?: string | null;
    type?: "online" | "acervo";
    source?: string | null;
    credit?: string | null;
    specimenId?: number | null;
  },
): Promise<GalleryImage> {
  const res = await apiFetch(`/api/v1/images/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const { image } = (await res.json()) as { image: GalleryImage };
  return image;
}

export async function deleteImage(id: number): Promise<void> {
  await apiFetch(`/api/v1/images/${id}`, { method: "DELETE" });
}

export async function setSpeciesThumbnail(
  speciesId: number,
  imageId: number | null,
): Promise<void> {
  await apiFetch(`/api/v1/species/${speciesId}/thumbnail`, {
    method: "PATCH",
    body: JSON.stringify({ imageId }),
  });
}

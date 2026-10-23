import { z } from "zod";
import { imageSchema } from "@/backend/http/features/article/article.schema";
import { apiFetch } from "@/frontend/shared/api/client";

export type GalleryImage = z.infer<typeof imageSchema>;

const imagesResponseSchema = z.object({
  images: z.array(imageSchema),
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

export type UploadImageInput = {
  file: File;
  speciesId: number;
  type: "online" | "acervo";
  alt?: string;
  source?: string;
  credit?: string;
  specimenId?: number;
};

export async function uploadImage({ file, ...fields }: UploadImageInput): Promise<GalleryImage> {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== "") body.append(key, String(value));
  }
  body.append("file", file);
  const res = await apiFetch("/api/v1/media", { method: "POST", body });
  const { image } = (await res.json()) as { image: GalleryImage };
  return image;
}

import { z } from "zod";

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
  const res = await fetch(`/api/v1/images?speciesId=${speciesId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao buscar imagens");
  return imagesResponseSchema.parse(await res.json()).images;
}

export async function getAllImages(): Promise<GalleryImage[]> {
  const res = await fetch("/api/v1/images", { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar imagens");
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
  const res = await fetch("/api/v1/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar imagem");
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
  const res = await fetch(`/api/v1/images/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar imagem");
  const { image } = (await res.json()) as { image: GalleryImage };
  return image;
}

export async function deleteImage(id: number): Promise<void> {
  const res = await fetch(`/api/v1/images/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao deletar imagem");
}

export async function setSpeciesThumbnail(
  speciesId: number,
  imageId: number | null,
): Promise<void> {
  const res = await fetch(`/api/v1/species/${speciesId}/thumbnail`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ imageId }),
  });
  if (!res.ok) throw new Error("Erro ao definir thumbnail");
}

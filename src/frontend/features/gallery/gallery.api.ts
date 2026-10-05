import { z } from "zod";

export const enrichedImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  alt: z.string().nullable(),
  type: z.enum(["online", "acervo"]).default("online"),
  source: z.string().nullable(),
  credit: z.string().nullable(),
  createdAt: z.string(),
  speciesId: z.number(),
  speciesName: z.string(),
  popularName: z.string().nullable(),
  taxonomyPath: z.array(z.object({ label: z.string(), labelValue: z.string() })),
  specimen: z
    .object({
      code: z.string(),
      shelf: z.number().nullable(),
      lot: z.number().nullable(),
    })
    .nullable(),
  speciesThumbnail: z.string().nullable(),
});

export type EnrichedImage = z.infer<typeof enrichedImageSchema>;

const galleryResponseSchema = z.object({
  images: z.array(enrichedImageSchema),
});

export async function getGallery(): Promise<EnrichedImage[]> {
  const res = await fetch("/api/v1/gallery");
  if (!res.ok) throw new Error("Erro ao carregar galeria");
  return galleryResponseSchema.parse(await res.json()).images;
}

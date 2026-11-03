import { z } from "zod";
import { imageSchema } from "@/backend/http/features/article/article.schema";

export const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const speciesIdQuerySchema = z.object({
  speciesId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const imagesPaginatedResponseSchema = z.object({
  images: z.array(imageSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

const imageTypeSchema = z.enum(["online", "acervo"]);

export const createImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  speciesId: z.number().int().positive(),
  type: imageTypeSchema.optional().default("online"),
  source: z.string().optional(),
  credit: z.string().optional(),
  specimenId: z.number().int().positive().optional(),
});

export const updateImageSchema = z.object({
  url: z.string().url().optional(),
  alt: z.string().nullable().optional(),
  type: imageTypeSchema.optional(),
  source: z.string().nullable().optional(),
  credit: z.string().nullable().optional(),
  specimenId: z.number().int().positive().nullable().optional(),
});

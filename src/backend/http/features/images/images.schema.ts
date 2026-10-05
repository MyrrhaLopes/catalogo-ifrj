import { z } from "zod";

export const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const speciesIdQuerySchema = z.object({
  speciesId: z.coerce.number().int().positive().optional(),
});

export const imageTypeSchema = z.enum(["online", "acervo"]);

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

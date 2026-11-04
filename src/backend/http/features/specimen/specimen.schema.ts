import { z } from "zod";

export const exposicaoSchema = z.enum(["humida", "seca"]);

export const specimenInsertSchema = z.object({
  code: z.string().min(1),
  exposicao: exposicaoSchema,
  lot: z.number().int().positive().optional(),
  shelf: z.number().int().positive().optional(),
});

export const specimenUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  exposicao: exposicaoSchema.optional(),
  lot: z.number().int().positive().nullable().optional(),
  shelf: z.number().int().positive().nullable().optional(),
  speciesId: z.number().int().positive().nullable().optional(),
});

const specimenSchema = z.object({
  id: z.number(),
  code: z.string(),
  exposicao: exposicaoSchema,
  lot: z.number().nullable(),
  shelf: z.number().nullable(),
  createdAt: z.string().nullable(),
  linkedSpeciesId: z.number().nullable(),
});
export type Specimen = z.infer<typeof specimenSchema>;

export const specimenListResponseSchema = z.object({
  specimens: z.array(specimenSchema),
  total: z.number(),
});

export const specimenPaginatedResponseSchema = z.object({
  specimens: z.array(specimenSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const parseExposicaoArray = (val: unknown): string[] | undefined => {
  if (typeof val === "string" && val.length > 0) return val.split(",");
  if (Array.isArray(val)) return val as string[];
  return undefined;
};

export const specimenSearchQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  exposicao: z.preprocess(parseExposicaoArray, z.array(exposicaoSchema).optional()),
});

import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createSpeciesSchema = z.object({
  speciesRoot: z.number().int().positive(),
  specimen: z.number().int().positive().optional(),
});

export const addPopularNameSchema = z.object({
  name: z.string().min(1),
  origin: z.string().optional(),
});

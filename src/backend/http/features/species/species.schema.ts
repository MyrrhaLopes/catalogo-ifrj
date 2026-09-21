import { z } from "zod";

// Response schemas
export const taxonomyNodeSchema = z.object({
  id: z.number(),
  label: z.string(),
  labelValue: z.string(),
});
export type TaxonomyNode = z.infer<typeof taxonomyNodeSchema>;

export const popularNameSchema = z.object({
  id: z.number(),
  name: z.string(),
  origin: z.string().nullable(),
});
export type PopularName = z.infer<typeof popularNameSchema>;

export const speciesAttributeSchema = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.enum(["meter", "minute"]),
});
export type SpeciesAttribute = z.infer<typeof speciesAttributeSchema>;

export const speciesBaseSchema = z.object({
  id: z.number(),
  speciesRoot: z.number(),
  specimen: z.number().nullable(),
  createdAt: z.string().nullable(),
  createdBy: z.string(),
});
export type SpeciesBase = z.infer<typeof speciesBaseSchema>;

export const speciesWithTaxonomySchema = speciesBaseSchema.extend({
  taxonomyPath: z.array(taxonomyNodeSchema),
  popularNames: z.array(popularNameSchema),
  attributes: z.array(speciesAttributeSchema),
});
export type SpeciesWithTaxonomy = z.infer<typeof speciesWithTaxonomySchema>;

export const speciesListResponseSchema = z.object({
  species: z.array(speciesBaseSchema),
});

export const speciesResponseSchema = z.object({
  species: speciesWithTaxonomySchema,
});

// Request schemas
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

export const speciesQuerySchema = z.object({
  withTaxonomy: z.coerce.boolean().optional().default(false),
});

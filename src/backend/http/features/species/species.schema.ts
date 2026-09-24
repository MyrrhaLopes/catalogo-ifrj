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
  unit: z.string(),
});
export type SpeciesAttribute = z.infer<typeof speciesAttributeSchema>;

export const linkedSpecimenSchema = z.object({
  id: z.number(),
  code: z.string(),
  lot: z.number().nullable(),
  shelf: z.number().nullable(),
});
export type LinkedSpecimen = z.infer<typeof linkedSpecimenSchema>;

export const speciesBaseSchema = z.object({
  id: z.number(),
  speciesRoot: z.number(),
  specimens: z.array(linkedSpecimenSchema),
  createdAt: z.string().nullable(),
  createdBy: z.string(),
});
export type SpeciesBase = z.infer<typeof speciesBaseSchema>;

export const specimenIdParamSchema = z.object({
  specimenId: z.coerce.number().int().positive(),
});

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
});

export const addPopularNameSchema = z.object({
  name: z.string().min(1),
  origin: z.string().optional(),
});

export const speciesQuerySchema = z.object({
  withTaxonomy: z.coerce.boolean().optional().default(false),
});

// Search schemas
export const attributeTemplateSchema = z.object({
  id: z.number(),
  label: z.string(),
  unit: z.string(),
});
export type AttributeTemplate = z.infer<typeof attributeTemplateSchema>;

export const speciesSearchResultSchema = speciesWithTaxonomySchema.extend({
  thumbnail: z.string().nullable(),
  excerpt: z.string().nullable(),
});
export type SpeciesSearchResult = z.infer<typeof speciesSearchResultSchema>;

export const searchResponseSchema = z.object({
  species: z.array(speciesSearchResultSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;

const parseIntArray = (val: unknown): number[] | undefined => {
  if (typeof val === "string" && val.length > 0)
    return val
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
  if (Array.isArray(val)) return val.map(Number).filter(Number.isFinite);
  return undefined;
};

const parseAttrs = (val: unknown) => {
  if (typeof val !== "string") return undefined;
  try {
    return JSON.parse(val);
  } catch {
    return undefined;
  }
};

export const setSpeciesAttributesSchema = z.object({
  attributes: z.array(
    z.object({
      templateId: z.number().int().positive(),
      value: z.string().min(1),
    }),
  ),
});

export const speciesListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  taxNodes: z.preprocess(parseIntArray, z.array(z.number().int().positive()).optional()),
  attrs: z.preprocess(
    parseAttrs,
    z
      .array(
        z.object({
          templateId: z.number().int().positive(),
          valueInBaseUnit: z.number(),
          operator: z.enum(["=", ">", "<"]).catch("="),
        }),
      )
      .optional(),
  ),
});

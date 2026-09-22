import { z } from "zod";

export const taxonomyNodeSchema = z.object({
  id: z.number(),
  label: z.string(),
  labelValue: z.string(),
  parent: z.number(),
});
export type TaxonomyNode = z.infer<typeof taxonomyNodeSchema>;

export const taxonomyListResponseSchema = z.object({
  nodes: z.array(taxonomyNodeSchema),
});

export const createTaxonomyNodeSchema = z.object({
  label: z.string().min(1),
  labelValue: z.string().min(1),
  parentId: z.number().int().positive(),
});
export type CreateTaxonomyNodeInput = z.infer<typeof createTaxonomyNodeSchema>;

export const updateTaxonomyNodeSchema = z.object({
  parentId: z.number().int().positive(),
});
export type UpdateTaxonomyNodeInput = z.infer<typeof updateTaxonomyNodeSchema>;

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

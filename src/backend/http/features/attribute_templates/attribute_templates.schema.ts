import { z } from "zod";

export const createAttributeTemplateSchema = z.object({
  label: z.string().min(1),
  unit: z.string().min(1),
});

export const updateAttributeTemplateSchema = z.object({
  label: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
}).refine((d) => d.label !== undefined || d.unit !== undefined, {
  message: "Ao menos um campo deve ser fornecido",
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const attributeTemplateDeleteImpactSchema = z.object({
  usageCount: z.number(),
});
export type AttributeTemplateDeleteImpact = z.infer<typeof attributeTemplateDeleteImpactSchema>;

export const attributeTemplateListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
});

const attributeTemplateItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  unit: z.string(),
});

export const attributeTemplatePaginatedResponseSchema = z.object({
  templates: z.array(attributeTemplateItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

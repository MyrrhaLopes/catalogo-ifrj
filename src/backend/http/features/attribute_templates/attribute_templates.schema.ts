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

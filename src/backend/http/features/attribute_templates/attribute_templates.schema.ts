import { z } from "zod";

const attributeTemplateKindSchema = z.enum(["numeric", "categorical"]);
export type AttributeTemplateKind = z.infer<typeof attributeTemplateKindSchema>;

// Categórico exige ao menos uma opção; numérico não deve carregar opções (evita
// uma lista "fantasma" que nunca é usada pela busca).
function refineKindOptions<T extends { kind?: AttributeTemplateKind; options?: string[] }>(
  d: T,
  ctx: z.RefinementCtx,
) {
  if (d.kind === "categorical" && (!d.options || d.options.length === 0)) {
    ctx.addIssue({
      code: "custom",
      message: "Atributos categóricos precisam de ao menos uma opção",
      path: ["options"],
    });
  }
  if (d.kind === "numeric" && d.options && d.options.length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Atributos numéricos não devem ter opções",
      path: ["options"],
    });
  }
}

// Numérico exige unidade (ex: metro, grama); categórico não tem unidade —
// o "valor" dele é um nome da lista fechada de options, nunca uma medida.
// `requireUnit` só vale na criação: um PATCH que só troca o kind (sem
// mencionar unit) não deve ser obrigado a reenviar a unidade já existente.
function refineKindUnit<T extends { kind?: AttributeTemplateKind; unit?: string }>(
  d: T,
  ctx: z.RefinementCtx,
  { requireUnit }: { requireUnit: boolean },
) {
  if (requireUnit && d.kind === "numeric" && (!d.unit || d.unit.trim().length === 0)) {
    ctx.addIssue({
      code: "custom",
      message: "Atributos numéricos precisam de uma unidade",
      path: ["unit"],
    });
  }
  if (d.kind === "categorical" && d.unit && d.unit.trim().length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Atributos categóricos não devem ter unidade",
      path: ["unit"],
    });
  }
}

export const createAttributeTemplateSchema = z
  .object({
    label: z.string().min(1),
    unit: z.string().optional(),
    kind: attributeTemplateKindSchema.default("numeric"),
    options: z.array(z.string().min(1)).optional(),
  })
  .superRefine((d, ctx) => {
    refineKindOptions(d, ctx);
    refineKindUnit(d, ctx, { requireUnit: true });
  });

export const updateAttributeTemplateSchema = z
  .object({
    label: z.string().min(1).optional(),
    unit: z.string().optional(),
    kind: attributeTemplateKindSchema.optional(),
    options: z.array(z.string().min(1)).optional(),
  })
  .refine((d) => d.label !== undefined || d.unit !== undefined || d.kind !== undefined || d.options !== undefined, {
    message: "Ao menos um campo deve ser fornecido",
  })
  .superRefine((d, ctx) => {
    if (d.kind !== undefined) {
      refineKindOptions(d, ctx);
      refineKindUnit(d, ctx, { requireUnit: false });
    }
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

export const attributeTemplateItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  unit: z.string(),
  kind: attributeTemplateKindSchema,
  options: z.array(z.string()).nullable(),
});
export type AttributeTemplateItem = z.infer<typeof attributeTemplateItemSchema>;

export const attributeTemplatePaginatedResponseSchema = z.object({
  templates: z.array(attributeTemplateItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

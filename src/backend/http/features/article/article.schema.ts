import { z } from "zod";

type ArticleBlock =
  | { type: "text"; content: string }
  | { type: "image"; content: string }
  | { type: "column"; columns: ArticleBlock[][] };

const textBlock = z.object({
  type: z.literal("text"),
  content: z.string(),
});

const imageBlock = z.object({
  type: z.literal("image"),
  content: z.string(),
});
const columnBlock = z.object({
  type: z.literal("column"),
  columns: z.array(
    z.array(z.lazy((): z.ZodType<ArticleBlock> => articleBlock)),
  ),
});

const articleBlock: z.ZodType<ArticleBlock> = z.union([
  textBlock,
  imageBlock,
  columnBlock,
]);

export const defaultArticleBlockName = z.enum(["TOC", "SOURCES", "PROPERTIES"]);

/**
 * Formato atual de um bloco padrão: fica sempre presente na seção e guarda se
 * está oculto. Assim a seção continua "existindo" mesmo com todos os seus
 * blocos padrão desabilitados.
 */
export const defaultArticleBlockItem = z.object({
  type: z.literal("default"),
  name: defaultArticleBlockName,
  disabled: z.boolean().default(false),
});

export const articleSectionItem = z.union([
  articleBlock,
  defaultArticleBlockItem,
  // Formato legado: string solta = bloco padrão visível. Defaults ocultos
  // simplesmente não apareciam no array. Mantido apenas para leitura.
  defaultArticleBlockName,
]);

export const articleSectionValues = z.array(articleSectionItem);

export const sectionKeys = z.enum(["left", "center", "right"]);

export const articleContent = z.object({
  sections: z
    .object({
      [sectionKeys.enum.left]: articleSectionValues.optional(),
      [sectionKeys.enum.center]: articleSectionValues.optional(),
      [sectionKeys.enum.right]: articleSectionValues.optional(),
    })
    .default({}),
});
export type ArticleContent = z.infer<typeof articleContent>;

export const imageSchema = z.object({
  id: z.number(),
  url: z.string(),
  alt: z.string().nullable(),
  article: z.number().nullable(),
  type: z.enum(["online", "acervo"]).default("online"),
  source: z.string().nullable(),
  credit: z.string().nullable(),
  specimenId: z.number().nullable(),
  speciesId: z.number().nullable(),
  createdAt: z.string(),
});

const articleSchema = z.object({
  id: z.number(),
  content: articleContent,
  createdAt: z.string(),
});
export type Article = z.infer<typeof articleSchema>;

const articleSourceSchema = z.object({
  id: z.number(),
  url: z.string(),
});
export type ArticleSource = z.infer<typeof articleSourceSchema>;

export const articleWithImagesSchema = z.object({
  article: articleSchema,
  images: z.array(imageSchema),
  sources: z.array(articleSourceSchema).default([]),
});

// Request schemas (used by route handlers)
export const speciesIdQuerySchema = z.object({
  speciesId: z.coerce.number().int().positive(),
});
export const articleIdParamSchema = z.object({
  articleId: z.coerce.number().int().positive(),
});
export const createArticleBodySchema = z.object({
  speciesId: z.number().int().positive(),
});

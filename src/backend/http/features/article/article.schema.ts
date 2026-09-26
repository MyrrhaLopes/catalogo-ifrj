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

const defaultArticleBlocks = z.enum(["TOC", "SOURCES", "PROPERTIES"]);

export const articleSectionValues = z.array(
  z.union([articleBlock, defaultArticleBlocks]),
);

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
  createdAt: z.string(),
});
export type ArticleImage = z.infer<typeof imageSchema>;

export const articleSchema = z.object({
  id: z.number(),
  content: articleContent,
  createdAt: z.string(),
});
export type Article = z.infer<typeof articleSchema>;

export const articleSourceSchema = z.object({
  id: z.number(),
  url: z.string(),
});
export type ArticleSource = z.infer<typeof articleSourceSchema>;

export const articleWithImagesSchema = z.object({
  article: articleSchema,
  images: z.array(imageSchema),
  sources: z.array(articleSourceSchema).default([]),
});
export type ArticleWithImages = z.infer<typeof articleWithImagesSchema>;

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

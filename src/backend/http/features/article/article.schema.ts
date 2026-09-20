import { z } from "zod";

export const articleSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

export const articleSourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

export const articleContentSchema = z.object({
  sections: z.array(articleSectionSchema).min(1),
  sources: z.array(articleSourceSchema).optional().default([]),
});

export type ArticleContent = z.infer<typeof articleContentSchema>;

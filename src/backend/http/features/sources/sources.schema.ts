import { z } from "zod";

export const createSourceSchema = z.object({
  url: z.string().min(1),
});

export const sourceResponseSchema = z.object({
  id: z.number(),
  url: z.string(),
});

export type SourceResponse = z.infer<typeof sourceResponseSchema>;

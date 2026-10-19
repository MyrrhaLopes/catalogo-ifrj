import { z } from "zod";

export const createSourceSchema = z.object({
  url: z.string().min(1),
});

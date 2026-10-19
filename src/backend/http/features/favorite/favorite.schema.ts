import { z } from "zod";

export const favoriteSyncBodySchema = z.object({
  ids: z.array(z.number().int().positive()),
});

export const speciesIdParamSchema = z.object({
  speciesId: z.coerce.number().int().positive(),
});

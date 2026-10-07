import { z } from "zod";

export const favoriteListResponseSchema = z.object({
  favoriteIds: z.array(z.number()),
});
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>;

export const favoriteToggleResponseSchema = z.object({
  action: z.enum(["added", "removed"]),
  speciesId: z.number(),
});
export type FavoriteToggleResponse = z.infer<typeof favoriteToggleResponseSchema>;

export const favoriteSyncBodySchema = z.object({
  ids: z.array(z.number().int().positive()),
});

export const speciesIdParamSchema = z.object({
  speciesId: z.coerce.number().int().positive(),
});

import { db } from "@/backend/db/drizzle";
import { favoritesTable } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";

export const FAVORITE_SERVICE = {
  getFavoriteIds: async (userId: string): Promise<number[]> => {
    const rows = await db
      .select({ speciesId: favoritesTable.speciesId })
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
    return rows.map((r) => r.speciesId);
  },

  toggleFavorite: async (
    userId: string,
    speciesId: number,
  ): Promise<"added" | "removed"> => {
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.speciesId, speciesId),
        ),
      );

    if (existing.length > 0) {
      await db
        .delete(favoritesTable)
        .where(
          and(
            eq(favoritesTable.userId, userId),
            eq(favoritesTable.speciesId, speciesId),
          ),
        );
      return "removed";
    }

    await db.insert(favoritesTable).values({ userId, speciesId });
    return "added";
  },

  syncFavorites: async (userId: string, ids: number[]): Promise<void> => {
    if (ids.length === 0) return;
    await db
      .insert(favoritesTable)
      .values(ids.map((speciesId) => ({ userId, speciesId })))
      .onConflictDoNothing();
  },
};

import { db } from "@/backend/db/drizzle";
import { sourceTable } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export const SOURCES_SERVICE = {
  listAll: async () => {
    return await db
      .select({ id: sourceTable.id, url: sourceTable.url })
      .from(sourceTable)
      .orderBy(sourceTable.id);
  },

  upsertByUrl: async (url: string): Promise<{ id: number; url: string }> => {
    const [existing] = await db
      .select({ id: sourceTable.id, url: sourceTable.url })
      .from(sourceTable)
      .where(eq(sourceTable.url, url));

    if (existing) return existing;

    const [created] = await db
      .insert(sourceTable)
      .values({ url })
      .returning({ id: sourceTable.id, url: sourceTable.url });

    return created;
  },
};

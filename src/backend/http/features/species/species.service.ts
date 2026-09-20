import { db } from "@/backend/db/drizzle";
import {
  speciesTable,
  popularNameTable,
  speciesPopularNamePivot,
  taxonomyTable,
  attributeTable,
  attributeTemplateTable,
  type SpeciesTableInsert,
} from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { ARTICLE_SERVICE } from "@/backend/http/features/article/article.service";

export const SPECIES_SERVICE = {
  registerSpecie: async (values: SpeciesTableInsert) => {
    const [newSpecies] = await db
      .insert(speciesTable)
      .values(values)
      .returning();
    return newSpecies;
  },

  getSpecies: async () => {
    return await db.select().from(speciesTable);
  },

  getSpecieById: async (specieId: number) => {
    const [species] = await db
      .select()
      .from(speciesTable)
      .where(eq(speciesTable.id, specieId));
    return species ?? null;
  },

  deleteSpecie: async (specieId: number) => {
    await db.delete(speciesTable).where(eq(speciesTable.id, specieId));
  },

  addPopularName: async (specieId: number, name: string, origin?: string) => {
    const [popularName] = await db
      .insert(popularNameTable)
      .values({ name, origin })
      .returning();
    await db
      .insert(speciesPopularNamePivot)
      .values({ speciesId: specieId, popularNameId: popularName.id });
    return popularName;
  },

  getSpeciesDetails: async (specieId: number) => {
    const [species] = await db
      .select()
      .from(speciesTable)
      .where(eq(speciesTable.id, specieId));

    if (!species) return null;

    // Walk taxonomy tree upward to build breadcrumb (cycle-safe via visited set)
    const taxonomyPath: Array<{ id: number; label: string; labelValue: string }> = [];
    const visited = new Set<number>();
    let currentId: number | null = species.speciesRoot;

    while (currentId !== null && !visited.has(currentId)) {
      visited.add(currentId);
      const [node] = await db
        .select({
          id: taxonomyTable.id,
          label: taxonomyTable.label,
          labelValue: taxonomyTable.labelValue,
          parent: taxonomyTable.parent,
        })
        .from(taxonomyTable)
        .where(eq(taxonomyTable.id, currentId));

      if (!node) break;
      taxonomyPath.unshift({ id: node.id, label: node.label, labelValue: node.labelValue });
      currentId = node.parent === currentId ? null : node.parent;
    }

    const popularNames = await db
      .select({
        id: popularNameTable.id,
        name: popularNameTable.name,
        origin: popularNameTable.origin,
      })
      .from(popularNameTable)
      .innerJoin(
        speciesPopularNamePivot,
        eq(popularNameTable.id, speciesPopularNamePivot.popularNameId),
      )
      .where(eq(speciesPopularNamePivot.speciesId, specieId));

    const attributes = await db
      .select({
        label: attributeTemplateTable.label,
        value: attributeTable.value,
        unit: attributeTemplateTable.unit,
      })
      .from(attributeTable)
      .innerJoin(
        attributeTemplateTable,
        eq(attributeTable.attribute, attributeTemplateTable.id),
      )
      .where(eq(attributeTable.species, specieId));

    const { article, images } = await ARTICLE_SERVICE.getBySpecies(specieId);

    return { ...species, taxonomyPath, popularNames, article, images, attributes };
  },
};

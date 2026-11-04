import "dotenv/config";
import { getOrCreateSeedUser, markAttributeTemplateCategorical, runSeedScript } from "./seeds/seed-helpers.ts";
import { seedCatalogo } from "./seeds/seed-especies-catalogo-2026-10.ts";

const IUCN_CATEGORIES = ["EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD", "NE"];

async function seed() {
  console.log("Seeding...");
  const user = await getOrCreateSeedUser();
  console.log(`Seed OK — user=${user.email}`);
  await seedCatalogo(user);
  await markAttributeTemplateCategorical("Status de conservação (IUCN)", IUCN_CATEGORIES);
}

runSeedScript(seed);

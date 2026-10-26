import "dotenv/config";
import { getOrCreateSeedUser, runSeedScript } from "./seeds/seed-helpers.ts";
import { seedCatalogo } from "./seeds/seed-especies-catalogo-2026-10.ts";

async function seed() {
  console.log("Seeding...");
  const user = await getOrCreateSeedUser();
  console.log(`Seed OK — user=${user.email}`);
  await seedCatalogo(user);
}

runSeedScript(seed);

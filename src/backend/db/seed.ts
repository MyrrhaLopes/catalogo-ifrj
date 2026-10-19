import "dotenv/config";
import { getOrCreateSeedUser, runSeedScript } from "./seeds/seed-helpers.ts";

async function seed() {
  console.log("Seeding...");
  const user = await getOrCreateSeedUser();
  console.log(`Seed OK — user=${user.email}`);
}

runSeedScript(seed);

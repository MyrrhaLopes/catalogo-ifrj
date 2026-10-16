import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./drizzle.ts";
import { usersTable } from "./schema.ts";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding...");

  // Usuário admin de seed, usado como createdBy pelos demais scripts de seed
  // (ex: db:seed:catalogo).
  let [user] = await db
    .insert(usersTable)
    .values({
      name: "Admin Seed",
      email: "seed@ifrj.edu.br",
      passwordHash: await bcrypt.hash("senha123", 10),
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "seed@ifrj.edu.br"));
    console.log("Usuário já existe, continuando seed com usuário existente.");
  }

  console.log(`Seed OK — user=${user.email}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

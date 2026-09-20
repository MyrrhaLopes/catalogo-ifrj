import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./drizzle.ts";
import {
  usersTable,
  taxonomyTable,
  speciesTable,
  articleTable,
} from "./schema.ts";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding...");

  // 1. Usuário
  const [user] = await db
    .insert(usersTable)
    .values({
      name: "Admin Seed",
      email: "seed@ifrj.edu.br",
      passwordHash: await bcrypt.hash("senha123", 10),
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    console.log("Usuário já existe, pulando seed.");
    process.exit(0);
  }

  // 2. Nó raiz auto-referente: usa nextval em CTE para id = parent
  const rootResult = await db.execute(sql`
    WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
    INSERT INTO taxonomies (id, label, label_value, created_by, parent)
    SELECT seq.id, 'Reino', 'animalia', ${user.id}::uuid, seq.id FROM seq
    RETURNING id
  `);
  const rootId = Number((rootResult.rows[0] as { id: unknown }).id);

  // 3. Hierarquia taxonômica
  const taxa = [
    { label: "Filo", labelValue: "chordata" },
    { label: "Classe", labelValue: "actinopterygii" },
    { label: "Ordem", labelValue: "perciformes" },
    { label: "Família", labelValue: "labridae" },
    { label: "Gênero", labelValue: "thalassoma" },
    { label: "Espécie", labelValue: "thalassoma_noronhanum" },
  ];

  let parentId = rootId;
  for (const t of taxa) {
    const [inserted] = await db
      .insert(taxonomyTable)
      .values({ ...t, parent: parentId, createdBy: user.id })
      .returning();
    parentId = inserted.id;
  }

  // 4. Espécie (speciesRoot aponta para o nó folha da taxonomia)
  const [species] = await db
    .insert(speciesTable)
    .values({ speciesRoot: parentId, createdBy: user.id })
    .returning();

  // 5. Artigo com conteúdo mínimo
  await db.insert(articleTable).values({
    species: species.id,
    content: { placeholder: true },
  });

  console.log(`Seed OK — species.id=${species.id}, user=${user.email}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

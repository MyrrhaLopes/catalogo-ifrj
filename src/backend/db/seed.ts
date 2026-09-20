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

  // 2. Taxonomia raiz (parent auto-referencia — precisa de SQL bruto)
  await db.execute(
    sql`INSERT INTO taxonomies (label, label_value, parent, created_by)
        VALUES ('Reino', 'animalia', currval(pg_get_serial_sequence('taxonomies','id')), ${user.id})
        ON CONFLICT DO NOTHING`,
  );

  // currval não funciona antes do primeiro uso da sequência; usa subquery
  await db.execute(sql`
    WITH ins AS (
      INSERT INTO taxonomies (label, label_value, created_by, parent)
      VALUES ('Reino', 'animalia', ${user.id}, 0)
      RETURNING id
    )
    UPDATE taxonomies SET parent = ins.id FROM ins WHERE taxonomies.id = ins.id
  `);

  const [root] = await db
    .select()
    .from(taxonomyTable)
    .where(sql`${taxonomyTable.labelValue} = 'animalia'`)
    .limit(1);

  // 3. Filo → Classe → Ordem → Família → Gênero → Espécie (nó folha)
  const taxa = [
    { label: "Filo", labelValue: "chordata" },
    { label: "Classe", labelValue: "actinopterygii" },
    { label: "Ordem", labelValue: "perciformes" },
    { label: "Família", labelValue: "labridae" },
    { label: "Gênero", labelValue: "thalassoma" },
    { label: "Espécie", labelValue: "thalassoma_noronhanum" },
  ];

  let parentId = root.id;
  for (const t of taxa) {
    const [inserted] = await db
      .insert(taxonomyTable)
      .values({ ...t, parent: parentId, createdBy: user.id })
      .returning();
    parentId = inserted.id;
  }

  const speciesRootId = parentId; // nó folha = a espécie em si

  // 4. Espécie
  const [species] = await db
    .insert(speciesTable)
    .values({ speciesRoot: speciesRootId, createdBy: user.id })
    .returning();

  // 5. Artigo (conteúdo mínimo — estrutura do jsonb ignorada)
  await db.insert(articleTable).values({
    species: species.id,
    content: { placeholder: true },
  });

  console.log(`Seed concluído. species.id = ${species.id}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

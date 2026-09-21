import "dotenv/config";
import { sql, eq } from "drizzle-orm";
import { db } from "./drizzle.ts";
import {
  usersTable,
  taxonomyTable,
  speciesTable,
  articleTable,
  popularNameTable,
  speciesPopularNamePivot,
} from "./schema.ts";
import bcrypt from "bcrypt";

const articleContent = {
  sections: {
    left: ["TOC"],
    center: [
      {
        type: "text",
        content:
          "# Distribuição de população\n\nConteúdo central do artigo sobre a espécie.\n\n# Morfologia\n\nDescrição morfológica da espécie.",
      },
      "SOURCES",
    ],
    right: ["PROPERTIES"],
  },
};

async function seed() {
  console.log("Seeding...");

  // 1. Usuário — busca existente se já houver conflito
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

  // 2. Nó raiz auto-referente: usa nextval em CTE para id = parent
  const rootResult = await db.execute(sql`
    WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
    INSERT INTO taxonomies (id, label, label_value, created_by, parent)
    SELECT seq.id, 'Reino', 'animalia', ${user.id}::uuid, seq.id FROM seq
    RETURNING id
  `);
  const rootId = Number((rootResult.rows[0] as { id: unknown }).id);

  // 3. Hierarquia taxonômica compartilhada até o gênero
  const sharedTaxa = [
    { label: "Filo", labelValue: "chordata" },
    { label: "Classe", labelValue: "actinopterygii" },
    { label: "Ordem", labelValue: "perciformes" },
    { label: "Família", labelValue: "labridae" },
    { label: "Gênero", labelValue: "thalassoma" },
  ];

  let parentId = rootId;
  for (const t of sharedTaxa) {
    const [inserted] = await db
      .insert(taxonomyTable)
      .values({ ...t, parent: parentId, createdBy: user.id })
      .returning();
    parentId = inserted.id;
  }
  const genusId = parentId;

  // 4a. Primeira espécie — sem nomes populares
  const [speciesNode1] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "noronhanum", parent: genusId, createdBy: user.id })
    .returning();

  const [species1] = await db
    .insert(speciesTable)
    .values({ speciesRoot: speciesNode1.id, createdBy: user.id })
    .returning();

  await db.insert(articleTable).values({ species: species1.id, content: articleContent });

  // 4b. Segunda espécie — com nomes populares para testar a interface
  const [speciesNode2] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "bifasciatum", parent: genusId, createdBy: user.id })
    .returning();

  const [species2] = await db
    .insert(speciesTable)
    .values({ speciesRoot: speciesNode2.id, createdBy: user.id })
    .returning();

  await db.insert(articleTable).values({ species: species2.id, content: articleContent });

  const popularNames = [
    { name: "budião-cabeçazul", origin: "pt-BR" },
    { name: "donzela-de-cabeça-azul", origin: "pt-BR" },
    { name: "bluehead wrasse", origin: "en" },
  ];

  for (const pn of popularNames) {
    const [inserted] = await db.insert(popularNameTable).values(pn).returning();
    await db
      .insert(speciesPopularNamePivot)
      .values({ speciesId: species2.id, popularNameId: inserted.id });
  }

  console.log(
    `Seed OK — species1.id=${species1.id}, species2.id=${species2.id}, user=${user.email}`,
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

import { and, eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../drizzle.ts";
import { attributeTemplateTable, taxonomyTable, usersTable } from "../schema.ts";

export async function getOrCreateSeedUser() {
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

  return user;
}

export function runSeedScript(seedFn: () => Promise<void>) {
  seedFn()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}

async function findExistingTaxonId(
  label: string,
  labelValue: string,
  parentCondition: ReturnType<typeof eq> | ReturnType<typeof sql>,
): Promise<number | undefined> {
  const [existing] = await db
    .select({ id: taxonomyTable.id })
    .from(taxonomyTable)
    .where(and(eq(taxonomyTable.label, label), eq(taxonomyTable.labelValue, labelValue), parentCondition));
  return existing?.id;
}

// Busca o nó raiz auto-referente (parent === id) com o label/labelValue dados,
// criando-o apenas se ainda não existir. Evita duas raízes "Reino/animalia"
// quando db:seed e db:seed:catalogo rodam contra o mesmo banco, em qualquer ordem.
export async function getOrCreateTaxonomyRoot(
  label: string,
  labelValue: string,
  userId: string,
): Promise<number> {
  const existingId = await findExistingTaxonId(
    label,
    labelValue,
    sql`${taxonomyTable.parent} = ${taxonomyTable.id}`,
  );
  if (existingId !== undefined) return existingId;

  const result = await db.execute(sql`
    WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
    INSERT INTO taxonomies (id, label, label_value, created_by, parent)
    SELECT seq.id, ${label}, ${labelValue}, ${userId}::uuid, seq.id FROM seq
    RETURNING id
  `);
  return Number((result.rows[0] as { id: unknown }).id);
}

// Busca um nó de taxonomia (label + labelValue + parent) já existente,
// criando-o apenas se ainda não existir. Evita ramos duplicados (ex: duas
// "Malacostraca" sob o mesmo parent) quando espécies diferentes compartilham
// ancestrais taxonômicos.
export async function getOrCreateTaxon(
  label: string,
  labelValue: string,
  parentId: number,
  userId: string,
): Promise<number> {
  const existingId = await findExistingTaxonId(
    label,
    labelValue,
    eq(taxonomyTable.parent, parentId),
  );
  if (existingId !== undefined) return existingId;

  const [inserted] = await db
    .insert(taxonomyTable)
    .values({ label, labelValue, parent: parentId, createdBy: userId })
    .returning({ id: taxonomyTable.id });
  return inserted.id;
}

// Busca um template de atributo (label + unit) já existente, criando-o apenas
// se ainda não existir. Garante que espécies diferentes que compartilham um
// mesmo atributo genérico (ex: "Comprimento corporal (macho)", cm) reutilizem
// a mesma linha de attributes_templates em vez de criar uma nova por espécie.
export async function getOrCreateAttributeTemplate(
  label: string,
  unit: string,
): Promise<number> {
  const [existing] = await db
    .select({ id: attributeTemplateTable.id })
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, label), eq(attributeTemplateTable.unit, unit)));
  if (existing) return existing.id;

  const [inserted] = await db
    .insert(attributeTemplateTable)
    .values({ label, unit })
    .returning({ id: attributeTemplateTable.id });
  return inserted.id;
}

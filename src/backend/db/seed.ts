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
  attributeTemplateTable,
  attributeTable,
  sourceTable,
  imageTable,
} from "./schema.ts";
import bcrypt from "bcrypt";

// Artigo simples para species1
const simpleArticleContent = {
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

// Artigo completo para species2 — usa todos os tipos de bloco
const fullArticleContent = {
  sections: {
    left: ["TOC"],
    center: [
      {
        type: "text",
        content: `# Morfologia

O *Thalassoma bifasciatum* (budião-cabeçazul) é um peixe ósseo da família Labridae que habita os recifes de coral do Atlântico ocidental. Os machos adultos em fase terminal apresentam coloração azul-esverdeada vibrante na cabeça, separada do corpo verde-amarelado por duas faixas verticais negras largas — característica que deu origem ao nome popular. Os exemplares em fase inicial — fêmeas e machos jovens — possuem coloração branca ou amarela com uma faixa lateral escura ao longo dos flancos.

A espécie atinge comprimento máximo de aproximadamente 30 cm, embora a maioria dos adultos meça entre 10 e 15 cm. A nadadeira caudal truncada, o perfil rostral pontiagudo e a coloração dimórfica são os principais caracteres diagnósticos [1].`,
      },
      {
        type: "image",
        content:
          "https://upload.wikimedia.org/wikipedia/commons/e/e4/Blue-headed_wrasse_det.jpg",
      },
      {
        type: "text",
        content: `# Comportamento

A espécie é diurna e territorial. Os machos em fase terminal controlam territórios de reprodução, expulsando outros machos rivais com exibições agressivas de nado rápido e coloração intensificada. O *T. bifasciatum* é protogínico hermafrodita: fêmeas podem se transformar em machos em questão de dias quando o macho dominante desaparece do grupo social.

A dieta é oportunista e inclui pequenos crustáceos, moluscos, vermes poliquetas e, notavelmente, ectoparasitas de outros peixes. A atividade de limpeza — remover parasitas do corpo de espécies maiores — é documentada em juvenis e em exemplares de fase inicial em estações de limpeza ativas nos recifes. A desova é pelágica e ocorre em grupos, com o macho liberando esperma sobre as ovas das fêmeas na coluna d'água [2].`,
      },
      {
        type: "column",
        columns: [
          [
            {
              type: "image",
              content:
                "https://upload.wikimedia.org/wikipedia/commons/e/e5/Bluehead_Thalassoma_bifasciatum_terminal_phase_%283474436593%29.jpg",
            },
            {
              type: "text",
              content:
                "**Macho em fase terminal** — coloração azul-esverdeada intensa na cabeça com faixas negras características.",
            },
          ],
          [
            {
              type: "image",
              content:
                "https://upload.wikimedia.org/wikipedia/commons/0/01/Thalassoma_bifasciatum_%28blue-headed_wrasse%29_in_juvenile_stage.jpg",
            },
            {
              type: "text",
              content:
                "**Fase inicial** — padrão branco e amarelado com faixa lateral escura, comum em fêmeas e jovens machos.",
            },
          ],
        ],
      },
      {
        type: "text",
        content: `# Distribuição Geográfica

O budião-cabeçazul ocorre amplamente no Atlântico ocidental tropical, desde a Flórida (EUA) e Bermudas até o sul do Brasil. É uma das espécies de peixes recifais mais abundantes do Caribe e está presente nas principais formações recifais da costa nordestina do Brasil, incluindo o Arquipélago de Fernando de Noronha e o Atol das Rocas.

A profundidade de ocorrência varia de 1 a 40 metros, com maior densidade nas zonas rasas de recife entre 2 e 15 metros, onde a cobertura de coral vivo e a disponibilidade de abrigo são maiores [3].`,
      },
      {
        type: "text",
        content: `# Conservação

A União Internacional para Conservação da Natureza (IUCN) classifica *T. bifasciatum* como **Pouco Preocupante** (*Least Concern* — LC) desde 2010. O amplo intervalo de distribuição geográfica, o tamanho populacional estimado em dezenas de milhões de indivíduos e a ausência de pressão pesqueira comercial significativa sustentam essa avaliação.

Ainda assim, a espécie é sensível à degradação do habitat recifal provocada pelo branqueamento de corais, pela sedimentação costeira e pelo aumento da temperatura da água associado às mudanças climáticas globais [4].`,
      },
      {
        type: "text",
        content: `[1] FishBase — Thalassoma bifasciatum: https://www.fishbase.se/summary/Thalassoma-bifasciatum.html
[2] Robertson D.R. & Choat J.H. 1974 — Protogynous hermaphroditism and social systems in labrid fish: https://www.int-res.com/abstracts/meps/v1/p361-368/
[3] Froese R. & Pauly D. 2024 — FishBase World Wide Web electronic publication: https://www.fishbase.org
[4] IUCN Red List — Thalassoma bifasciatum assessment 2010: https://www.iucnredlist.org/species/190834/1952966`,
      },
      "SOURCES",
    ],
    right: ["PROPERTIES"],
  },
};

async function seed() {
  console.log("Seeding...");

  // 1. Usuário
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

  // 2. Nó raiz auto-referente
  const rootResult = await db.execute(sql`
    WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
    INSERT INTO taxonomies (id, label, label_value, created_by, parent)
    SELECT seq.id, 'Reino', 'animalia', ${user.id}::uuid, seq.id FROM seq
    RETURNING id
  `);
  const rootId = Number((rootResult.rows[0] as { id: unknown }).id);

  // 3. Hierarquia taxonômica
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

  // 4a. Espécie simples
  const [speciesNode1] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "noronhanum", parent: genusId, createdBy: user.id })
    .returning();

  const [species1] = await db
    .insert(speciesTable)
    .values({ speciesRoot: speciesNode1.id, createdBy: user.id })
    .returning();

  await db.insert(articleTable).values({ species: species1.id, content: simpleArticleContent });

  // 4b. Espécie completa — todos os blocos + atributos
  const [speciesNode2] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "bifasciatum", parent: genusId, createdBy: user.id })
    .returning();

  const [species2] = await db
    .insert(speciesTable)
    .values({ speciesRoot: speciesNode2.id, createdBy: user.id })
    .returning();

  const [article2] = await db
    .insert(articleTable)
    .values({ species: species2.id, content: fullArticleContent })
    .returning();

  await db.insert(imageTable).values([
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Blue-headed_wrasse_det.jpg",
      alt: "Thalassoma bifasciatum — macho adulto em fase terminal",
      article: article2.id,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Bluehead_Thalassoma_bifasciatum_terminal_phase_%283474436593%29.jpg",
      alt: "Thalassoma bifasciatum — macho em fase terminal, vista lateral",
      article: article2.id,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/01/Thalassoma_bifasciatum_%28blue-headed_wrasse%29_in_juvenile_stage.jpg",
      alt: "Thalassoma bifasciatum — fase inicial (fêmea ou jovem)",
      article: article2.id,
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Thalassoma_bifasciatum_1.jpg/320px-Thalassoma_bifasciatum_1.jpg",
      alt: "Thalassoma bifasciatum — grupo em recife de coral",
      article: article2.id,
    },
  ]);

  // Nomes populares
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

  // 5. Fontes para atributos
  const [sourceFishBase] = await db
    .insert(sourceTable)
    .values({ url: "https://www.fishbase.se/summary/Thalassoma-bifasciatum.html" })
    .returning();

  const [sourceIucn] = await db
    .insert(sourceTable)
    .values({ url: "https://www.iucnredlist.org/species/190834/1952966" })
    .returning();

  // 6. Templates de atributos
  const [templateComprimento] = await db
    .insert(attributeTemplateTable)
    .values({ label: "Comprimento máximo", unit: "meter", source: sourceFishBase.id })
    .returning();

  const [templateProfundidade] = await db
    .insert(attributeTemplateTable)
    .values({ label: "Profundidade máxima", unit: "meter", source: sourceIucn.id })
    .returning();

  const [templateHabitat] = await db
    .insert(attributeTemplateTable)
    .values({ label: "Profundidade média de habitat", unit: "meter", source: sourceFishBase.id })
    .returning();

  // 7. Valores dos atributos para species2
  await db.insert(attributeTable).values([
    { species: species2.id, attribute: templateComprimento.id, value: "0.30" },
    { species: species2.id, attribute: templateProfundidade.id, value: "40" },
    { species: species2.id, attribute: templateHabitat.id, value: "8" },
  ]);

  console.log(
    `Seed OK — species1.id=${species1.id} (simples), species2.id=${species2.id} (completa, article=${article2.id}, 4 imagens), user=${user.email}`,
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./drizzle.ts";

async function reset() {
  console.log("Limpando banco de dados...");

  await db.execute(sql`
    TRUNCATE TABLE
      sessions,
      article_records,
      images_article_pivot,
      images,
      attributes,
      species_popular_name_pivot,
      articles,
      attributes_templates,
      sources,
      popular_names,
      species,
      specimens,
      taxonomies,
      users
    RESTART IDENTITY CASCADE
  `);

  console.log("Banco limpo com sucesso.");
}

reset()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

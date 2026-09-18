import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  type AnyPgColumn,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { AlignVerticalDistributeStart } from "lucide-react";

export const taxonomyTable = pgTable("taxonomies", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  labelValue: text("label_value").notNull(),
  parent: integer("parent")
    .references((): AnyPgColumn => taxonomyTable.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => usersTable.id)
    .notNull(),
});

export const specimenTable = pgTable("specimens", {
  id: serial("id").primaryKey(),
  lot: integer("lot"),
  shelf: integer("shelf"),
  code: text("code").notNull(),
  createdBy: uuid("created_by")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export type SpecimenTableInsert = typeof specimenTable.$inferInsert;

export const speciesTable = pgTable("species", {
  id: serial("id").primaryKey(),
  speciesRoot: integer("sepecies")
    .references(() => taxonomyTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  specimen: integer("specimen").references(() => specimenTable.id, {
    onDelete: "set null",
  }), //permitir criar espécies e seus artigos por mais que não haja um espécime físico no catálogo
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by")
    .references(() => usersTable.id)
    .notNull(),
});
export type SpeciesTableInsert = typeof speciesTable.$inferInsert;
export type SpeciesTableSelect = typeof speciesTable.$inferSelect;

export const popularNameTable = pgTable("popular_names", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin"),
});

export const speciesPopularNamePivot = pgTable(
  "species_popular_name_pivot",
  {
    popularNameId: integer("popular_name_id").references(
      () => popularNameTable.id,
    ),
    speciesId: integer("species_id").references(() => speciesTable.id),
  },
  (table) => [primaryKey({ columns: [table.popularNameId, table.speciesId] })],
);

export const articleTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  content: jsonb("content").notNull(),
  species: integer("species")
    .references(() => speciesTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const articleRecordTable = pgTable("article_records", {
  id: serial("id").primaryKey(),
  content: jsonb("content").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  edited_by: uuid("edited_by")
    .references(() => usersTable.id)
    .notNull(),
  species: integer("species")
    .references(() => speciesTable.id)
    .notNull(),
});

export const unitsEnums = pgEnum("units", ["meter", "minute"]);

export const attributeTemplateTable = pgTable("attributes_templates", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  unit: unitsEnums("unit").notNull(),
  source: integer("source").references(() => sourceTable.id),
});

export const attributeTable = pgTable(
  "attributes",
  {
    species: integer("species")
      .references(() => speciesTable.id, { onDelete: "set null" })
      .notNull(),
    attribute: integer("attribute").references(() => attributeTemplateTable.id),
    value: text("value").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.species, table.attribute, table.value] }),
  ],
);

export const imageTable = pgTable("images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt"),
  article: integer("article").references(() => articleTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const imagesArticlePivotTable = pgTable(
  "images_article_pivot",
  {
    imageId: integer("image_id").references(() => imageTable.id),
    articleId: integer("article_id").references(() => articleTable.id),
  },
  (table) => [primaryKey({ columns: [table.imageId, table.articleId] })],
);

export const sourceTable = pgTable("sources", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
});

// Tabela de usuários. A senha nunca é armazenada em texto puro —
// apenas o hash bcrypt (campo password_hash).
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(), // unicidade garantida pelo banco
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type UserInsert = typeof usersTable.$inferSelect;

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at")
    .notNull()
    .default(sql`now() + interval '7 days'`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

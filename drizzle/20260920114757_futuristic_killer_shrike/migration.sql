CREATE TYPE "units" AS ENUM('meter', 'minute');--> statement-breakpoint
CREATE TABLE "article_records" (
	"id" serial PRIMARY KEY,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_by" uuid NOT NULL,
	"species" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY,
	"content" jsonb NOT NULL,
	"species" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"species" integer,
	"attribute" integer,
	"value" text,
	CONSTRAINT "attributes_pkey" PRIMARY KEY("species","attribute","value")
);
--> statement-breakpoint
CREATE TABLE "attributes_templates" (
	"id" serial PRIMARY KEY,
	"label" text NOT NULL,
	"unit" "units" NOT NULL,
	"source" integer
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY,
	"url" text NOT NULL,
	"alt" text,
	"article" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images_article_pivot" (
	"image_id" integer,
	"article_id" integer,
	CONSTRAINT "images_article_pivot_pkey" PRIMARY KEY("image_id","article_id")
);
--> statement-breakpoint
CREATE TABLE "popular_names" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"origin" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"expires_at" timestamp DEFAULT now() + interval '7 days' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "species_popular_name_pivot" (
	"popular_name_id" integer,
	"species_id" integer,
	CONSTRAINT "species_popular_name_pivot_pkey" PRIMARY KEY("popular_name_id","species_id")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" serial PRIMARY KEY,
	"sepecies" integer NOT NULL,
	"specimen" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specimens" (
	"id" serial PRIMARY KEY,
	"lot" integer,
	"shelf" integer,
	"code" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "taxonomies" (
	"id" serial PRIMARY KEY,
	"label" text NOT NULL,
	"label_value" text NOT NULL,
	"parent" integer NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "article_records" ADD CONSTRAINT "article_records_edited_by_users_id_fkey" FOREIGN KEY ("edited_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "article_records" ADD CONSTRAINT "article_records_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id");--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id");--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_attribute_attributes_templates_id_fkey" FOREIGN KEY ("attribute") REFERENCES "attributes_templates"("id");--> statement-breakpoint
ALTER TABLE "attributes_templates" ADD CONSTRAINT "attributes_templates_source_sources_id_fkey" FOREIGN KEY ("source") REFERENCES "sources"("id");--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_article_articles_id_fkey" FOREIGN KEY ("article") REFERENCES "articles"("id");--> statement-breakpoint
ALTER TABLE "images_article_pivot" ADD CONSTRAINT "images_article_pivot_image_id_images_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id");--> statement-breakpoint
ALTER TABLE "images_article_pivot" ADD CONSTRAINT "images_article_pivot_article_id_articles_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "species_popular_name_pivot" ADD CONSTRAINT "species_popular_name_pivot_jFj0gdNxMWso_fkey" FOREIGN KEY ("popular_name_id") REFERENCES "popular_names"("id");--> statement-breakpoint
ALTER TABLE "species_popular_name_pivot" ADD CONSTRAINT "species_popular_name_pivot_species_id_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id");--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_sepecies_taxonomies_id_fkey" FOREIGN KEY ("sepecies") REFERENCES "taxonomies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_specimen_specimens_id_fkey" FOREIGN KEY ("specimen") REFERENCES "specimens"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "specimens" ADD CONSTRAINT "specimens_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_parent_taxonomies_id_fkey" FOREIGN KEY ("parent") REFERENCES "taxonomies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
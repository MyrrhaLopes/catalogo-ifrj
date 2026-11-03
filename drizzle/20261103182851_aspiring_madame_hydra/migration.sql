ALTER TABLE "species" ADD COLUMN IF NOT EXISTS "scientific_name_override" text;--> statement-breakpoint
ALTER TABLE "specimens" ADD COLUMN IF NOT EXISTS "exposicao" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "specimens" ALTER COLUMN "exposicao" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "specimens" ADD CONSTRAINT "specimens_code_exposicao_unique" UNIQUE("code","exposicao");
EXCEPTION WHEN duplicate_table THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "article_records" DROP CONSTRAINT IF EXISTS "article_records_species_species_id_fkey";--> statement-breakpoint
ALTER TABLE "article_records" ADD CONSTRAINT "article_records_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_species_species_id_fkey";--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attributes" DROP CONSTRAINT IF EXISTS "attributes_species_species_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_species_species_id_fkey" FOREIGN KEY ("species") REFERENCES "species"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attributes" DROP CONSTRAINT IF EXISTS "attributes_attribute_attributes_templates_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_attribute_attributes_templates_id_fkey" FOREIGN KEY ("attribute") REFERENCES "attributes_templates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "images_article_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_article_articles_id_fkey" FOREIGN KEY ("article") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "images_article_pivot" DROP CONSTRAINT IF EXISTS "images_article_pivot_image_id_images_id_fkey";--> statement-breakpoint
ALTER TABLE "images_article_pivot" ADD CONSTRAINT "images_article_pivot_image_id_images_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "images_article_pivot" DROP CONSTRAINT IF EXISTS "images_article_pivot_article_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "images_article_pivot" ADD CONSTRAINT "images_article_pivot_article_id_articles_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "species_popular_name_pivot" DROP CONSTRAINT IF EXISTS "species_popular_name_pivot_species_id_species_id_fkey";--> statement-breakpoint
ALTER TABLE "species_popular_name_pivot" ADD CONSTRAINT "species_popular_name_pivot_species_id_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE CASCADE;

ALTER TABLE "attributes_templates" DROP CONSTRAINT "attributes_templates_source_sources_id_fkey";--> statement-breakpoint
ALTER TABLE "species" DROP CONSTRAINT "species_specimen_specimens_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes" ADD COLUMN "source_id" integer;--> statement-breakpoint
ALTER TABLE "specimens" ADD COLUMN "species_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attributes_templates" DROP COLUMN "source";--> statement-breakpoint
ALTER TABLE "species" DROP COLUMN "specimen";--> statement-breakpoint
ALTER TABLE "attributes_templates" ALTER COLUMN "unit" SET DATA TYPE text USING "unit"::text;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_url_unique" UNIQUE("url");--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_source_id_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "specimens" ADD CONSTRAINT "specimens_species_id_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL;--> statement-breakpoint
DROP TYPE "units";
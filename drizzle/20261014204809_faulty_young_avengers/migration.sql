CREATE TABLE "favorites" (
	"user_id" uuid,
	"species_id" integer,
	CONSTRAINT "favorites_pkey" PRIMARY KEY("user_id","species_id")
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "type" text DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "credit" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "specimen_id" integer;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "thumbnail_image_id" integer;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_species_id_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_specimen_id_specimens_id_fkey" FOREIGN KEY ("specimen_id") REFERENCES "specimens"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_thumbnail_image_id_images_id_fkey" FOREIGN KEY ("thumbnail_image_id") REFERENCES "images"("id") ON DELETE SET NULL;
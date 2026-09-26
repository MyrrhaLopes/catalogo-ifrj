CREATE TABLE "article_sources_pivot" (
	"article_id" integer,
	"source_id" integer,
	CONSTRAINT "article_sources_pivot_pkey" PRIMARY KEY("article_id","source_id")
);
--> statement-breakpoint
ALTER TABLE "article_sources_pivot" ADD CONSTRAINT "article_sources_pivot_article_id_articles_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "article_sources_pivot" ADD CONSTRAINT "article_sources_pivot_source_id_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE;
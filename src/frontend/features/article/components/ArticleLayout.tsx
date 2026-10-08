import { ArticleViewProvider } from "../context/ArticleViewContext";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { SourceMaps } from "./types";
import { ArticleSectionRenderer } from "./ArticleSectionRenderer";

type ArticleLayoutProps = {
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  inlineSources: ArticleSource[];
  attributeSources: { url: string }[];
};

export function ArticleLayout({ content, species, sourceMaps, inlineSources, attributeSources }: ArticleLayoutProps) {
  return (
    <ArticleViewProvider value={{ content, species, sourceMaps, inlineSources, attributeSources }}>
      <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
        {content.sections.left && content.sections.left.length > 0 && (
          <aside className="w-44 shrink-0 sticky top-6 self-start">
            <ArticleSectionRenderer sectionKey="left" />
          </aside>
        )}
        {content.sections.center && content.sections.center.length > 0 && (
          <article className="flex-1 min-w-0">
            <ArticleSectionRenderer sectionKey="center" />
          </article>
        )}
        {content.sections.right && content.sections.right.length > 0 && (
          <aside className="w-52 shrink-0 sticky top-6 self-start">
            <ArticleSectionRenderer sectionKey="right" />
          </aside>
        )}
      </div>
    </ArticleViewProvider>
  );
}

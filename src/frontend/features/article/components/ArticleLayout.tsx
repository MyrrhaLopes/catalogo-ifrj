import { ArticleViewProvider } from "../context/ArticleViewContext";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { SourceMaps } from "./types";
import { ArticleContentTabs } from "./ArticleContentTabs";

type ArticleLayoutProps = {
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  inlineSources: ArticleSource[];
  attributeSources: { url: string }[];
};

export function ArticleLayout({ content, species, sourceMaps, inlineSources, attributeSources }: ArticleLayoutProps) {
  const hasLeft = (content.sections.left?.length ?? 0) > 0;
  const hasCenter = (content.sections.center?.length ?? 0) > 0;
  const hasRight = (content.sections.right?.length ?? 0) > 0;

  return (
    <ArticleViewProvider value={{ content, species, sourceMaps, inlineSources, attributeSources }}>
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-6 sm:px-6 md:px-8 lg:flex-row lg:gap-10 lg:px-10 lg:py-10 tv:max-w-screen-2xl tv:gap-14 tv:px-16">
        <ArticleContentTabs hasLeft={hasLeft} hasCenter={hasCenter} hasRight={hasRight} />
      </div>
    </ArticleViewProvider>
  );
}

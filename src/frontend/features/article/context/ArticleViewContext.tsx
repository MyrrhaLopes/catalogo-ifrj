import { createContext, useContext } from "react";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { SourceMaps } from "@/frontend/features/article/components/types";

export interface ArticleViewContextValue {
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  inlineSources: ArticleSource[];
  attributeSources: { url: string }[];
}

const ArticleViewContext = createContext<ArticleViewContextValue | null>(null);

export const ArticleViewProvider = ArticleViewContext.Provider;

export function useArticleView(): ArticleViewContextValue {
  const ctx = useContext(ArticleViewContext);
  if (!ctx) throw new Error("useArticleView must be used within ArticleViewProvider");
  return ctx;
}

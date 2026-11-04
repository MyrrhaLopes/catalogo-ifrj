import { useMemo } from "react";
import { ArticleViewProvider } from "../context/ArticleViewContext";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import type { SectionItem, SourceMaps } from "./types";
import { ArticleContentTabs } from "./ArticleContentTabs";

type ArticleLayoutProps = {
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  inlineSources: ArticleSource[];
  attributeSources: { url: string }[];
  onImageClick?: (url: string) => void;
};

/**
 * Normaliza os itens para renderização: defaults visíveis viram o nome
 * ("TOC" etc., formato aceito pelo ArticleBlockRenderer) e defaults ocultos
 * são descartados. Aceita tanto o formato novo (objeto) quanto o legado (string).
 */
function toRenderableItems(items: SectionItem[] | undefined): SectionItem[] {
  return (items ?? []).flatMap((item): SectionItem[] => {
    if (typeof item === "string") return [item];
    if (item.type === "default") return item.disabled ? [] : [item.name];
    return [item];
  });
}

export function ArticleLayout({ content, species, sourceMaps, inlineSources, attributeSources, onImageClick }: ArticleLayoutProps) {
  const renderContent = useMemo<ArticleContent>(
    () => ({
      sections: {
        left: toRenderableItems(content.sections.left),
        center: toRenderableItems(content.sections.center),
        right: toRenderableItems(content.sections.right),
      },
    }),
    [content],
  );

  // "Tem conteúdo visível" — usado só no layout mobile (abas / blocos empilhados).
  // No desktop as 3 seções sempre reservam sua largura (ver ArticleContentTabs).
  const hasLeft = (renderContent.sections.left?.length ?? 0) > 0;
  const hasCenter = (renderContent.sections.center?.length ?? 0) > 0;
  const hasRight = (renderContent.sections.right?.length ?? 0) > 0;

  return (
    <ArticleViewProvider
      value={{ content: renderContent, species, sourceMaps, inlineSources, attributeSources, onImageClick }}
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-6 sm:px-6 md:px-8 lg:flex-row lg:gap-10 lg:px-10 lg:py-10 tv:max-w-screen-2xl tv:gap-14 tv:px-16">
        <ArticleContentTabs hasLeft={hasLeft} hasCenter={hasCenter} hasRight={hasRight} />
      </div>
    </ArticleViewProvider>
  );
}

import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { SpeciesDetails } from "../../species/species.api";
import type { SectionItem } from "./types";
import { ArticleBlockRenderer } from "./ArticleBlockRenderer";

export function ArticleSectionRenderer({
  sectionKey,
  content,
  species,
}: {
  sectionKey: "left" | "center" | "right";
  content: ArticleContent;
  species: SpeciesDetails;
}) {
  const blocks = (content.sections[sectionKey] as SectionItem[] | undefined) ?? [];

  return (
    <>
      {blocks.map((block, i) => (
        <ArticleBlockRenderer key={i} block={block} content={content} species={species} />
      ))}
    </>
  );
}

import { z } from "zod";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import {
  sectionKeys,
  articleSectionValues,
} from "@/backend/http/features/article/article.schema";
import type { SpeciesDetails } from "../../species/species.api";
import { ArticleBlockRenderer } from "./ArticleBlockRenderer";

export function ArticleSectionRenderer({
  sectionKey,
  content,
  species,
}: {
  sectionKey: z.infer<typeof sectionKeys>;
  content: ArticleContent;
  species: SpeciesDetails;
}) {
  const blocks = articleSectionValues.parse(content.sections[sectionKey] ?? []);

  return (
    <>
      {blocks.map((block, i) => (
        <ArticleBlockRenderer key={i} block={block} content={content} species={species} />
      ))}
    </>
  );
}

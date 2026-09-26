import { z } from "zod";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import {
  sectionKeys,
  articleSectionValues,
} from "@/backend/http/features/article/article.schema";
import type { SpeciesDetails } from "../../species/species.api";
import type { SourceMaps } from "./types";
import { ArticleBlockRenderer } from "./ArticleBlockRenderer";

type Props = {
  sectionKey: z.infer<typeof sectionKeys>;
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps?: SourceMaps;
  inlineSources?: ArticleSource[];
  attributeSources?: { url: string }[];
};

export function ArticleSectionRenderer({ sectionKey, content, species, sourceMaps, inlineSources, attributeSources }: Props) {
  const blocks = articleSectionValues.parse(content.sections[sectionKey] ?? []);

  return (
    <>
      {blocks.map((block, i) => (
        <ArticleBlockRenderer
          key={i}
          block={block}
          content={content}
          species={species}
          sourceMaps={sourceMaps}
          inlineSources={inlineSources}
          attributeSources={attributeSources}
        />
      ))}
    </>
  );
}

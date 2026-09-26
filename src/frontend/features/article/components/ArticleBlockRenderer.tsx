import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import type { SpeciesDetails } from "../../species/species.api";
import type { SectionItem, SourceMaps } from "./types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ColumnBlock } from "./ColumnBlock";
import { TOCBlock } from "./TOCBlock";
import { SourcesBlock } from "./SourcesBlock";
import { PropertiesBlock } from "./PropertiesBlock";

type Props = {
  block: SectionItem;
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps?: SourceMaps;
  inlineSources?: ArticleSource[];
  attributeSources?: { url: string }[];
};

export function ArticleBlockRenderer({ block, content, species, sourceMaps, inlineSources, attributeSources }: Props) {
  if (block === "TOC") return <TOCBlock content={content} />;
  if (block === "SOURCES") return <SourcesBlock content={content} inlineSources={inlineSources} attributeSources={attributeSources} />;
  if (block === "PROPERTIES") return <PropertiesBlock species={species} sourcesMap={sourceMaps?.byUrl} />;

  if (block.type === "text") return <TextBlock content={block.content} sourcesMap={sourceMaps?.byId} />;
  if (block.type === "image") return <ImageBlock content={block.content} />;
  if (block.type === "column") {
    return (
      <ColumnBlock
        columns={block.columns}
        renderBlock={(b, key) => (
          <ArticleBlockRenderer
            key={key}
            block={b}
            content={content}
            species={species}
            sourceMaps={sourceMaps}
            inlineSources={inlineSources}
            attributeSources={attributeSources}
          />
        )}
      />
    );
  }

  return null;
}

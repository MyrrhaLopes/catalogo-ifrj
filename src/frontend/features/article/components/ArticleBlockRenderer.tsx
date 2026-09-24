import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { SpeciesDetails } from "../../species/species.api";
import type { SectionItem } from "./types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ColumnBlock } from "./ColumnBlock";
import { TOCBlock } from "./TOCBlock";
import { SourcesBlock } from "./SourcesBlock";
import { PropertiesBlock } from "./PropertiesBlock";

export function ArticleBlockRenderer({
  block,
  content,
  species,
}: {
  block: SectionItem;
  content: ArticleContent;
  species: SpeciesDetails;
}) {
  if (block === "TOC") return <TOCBlock content={content} />;
  if (block === "SOURCES") return <SourcesBlock content={content} />;
  if (block === "PROPERTIES") return <PropertiesBlock species={species} />;

  if (block.type === "text") return <TextBlock content={block.content} />;
  if (block.type === "image") return <ImageBlock content={block.content} />;
  if (block.type === "column") {
    return (
      <ColumnBlock
        columns={block.columns}
        renderBlock={(b, key) => (
          <ArticleBlockRenderer key={key} block={b} content={content} species={species} />
        )}
      />
    );
  }

  return null;
}

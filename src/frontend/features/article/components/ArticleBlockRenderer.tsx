import type { SectionItem } from "./types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ColumnBlock } from "./ColumnBlock";
import { TOCBlock } from "./TOCBlock";
import { SourcesBlock } from "./SourcesBlock";
import { PropertiesBlock } from "./PropertiesBlock";
import { useArticleView } from "../context/ArticleViewContext";

export function ArticleBlockRenderer({ block }: { block: SectionItem }) {
  const { content, species, sourceMaps, inlineSources, attributeSources } = useArticleView();

  if (block === "TOC") return <TOCBlock content={content} />;
  if (block === "SOURCES") return <SourcesBlock content={content} inlineSources={inlineSources} attributeSources={attributeSources} />;
  if (block === "PROPERTIES") return <PropertiesBlock species={species} sourcesMap={sourceMaps?.byUrl} />;
  if (block.type === "text") return <TextBlock content={block.content} sourcesMap={sourceMaps?.byId} />;
  if (block.type === "image") return <ImageBlock content={block.content} />;
  if (block.type === "column") {
    return (
      <ColumnBlock
        columns={block.columns}
        renderBlock={(b, key) => <ArticleBlockRenderer key={key} block={b} />}
      />
    );
  }

  return null;
}

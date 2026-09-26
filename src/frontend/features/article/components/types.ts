export type TextBlock = { type: "text"; content: string };
export type ImageBlock = { type: "image"; content: string };
export type ColumnBlock = { type: "column"; columns: ArticleBlock[][] };
export type ArticleBlock = TextBlock | ImageBlock | ColumnBlock;
export type DefaultBlock = "TOC" | "SOURCES" | "PROPERTIES";
export type SectionItem = ArticleBlock | DefaultBlock;

export type SourceMaps = {
  byId: Map<number, number>;
  byUrl: Map<string, number>;
};

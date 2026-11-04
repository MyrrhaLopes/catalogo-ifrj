export type TextBlock = { type: "text"; content: string };
export type ImageBlock = { type: "image"; content: string };
export type ColumnBlock = { type: "column"; columns: ArticleBlock[][] };
export type ArticleBlock = TextBlock | ImageBlock | ColumnBlock;
export type DefaultBlock = "TOC" | "SOURCES" | "PROPERTIES";
/** Bloco padrão no formato persistido atual (com estado de visibilidade). */
export type DefaultBlockItem = { type: "default"; name: DefaultBlock; disabled: boolean };
/** Item de seção persistido: bloco, bloco padrão (objeto) ou bloco padrão legado (string). */
export type SectionItem = ArticleBlock | DefaultBlockItem | DefaultBlock;

export type SourceMaps = {
  byId: Map<number, number>;
  byUrl: Map<string, number>;
};

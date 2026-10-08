import { z } from "zod";
import { sectionKeys, articleSectionValues } from "@/backend/http/features/article/article.schema";
import { ArticleBlockRenderer } from "./ArticleBlockRenderer";
import { useArticleView } from "../context/ArticleViewContext";

type Props = {
  sectionKey: z.infer<typeof sectionKeys>;
};

export function ArticleSectionRenderer({ sectionKey }: Props) {
  const { content } = useArticleView();
  const blocks = articleSectionValues.parse(content.sections[sectionKey] ?? []);

  return (
    <>
      {blocks.map((block, i) => (
        <ArticleBlockRenderer key={i} block={block} />
      ))}
    </>
  );
}

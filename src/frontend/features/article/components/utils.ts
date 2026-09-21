import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleBlock, TextBlock } from "./types";

export type Heading = { level: number; text: string; id: string };
export type Source = { index: number; label: string; url: string };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function collectTextBlocks(blocks: ArticleBlock[]): TextBlock[] {
  return blocks.flatMap((block) => {
    if (block.type === "text") return [block];
    if (block.type === "column") return block.columns.flatMap(collectTextBlocks);
    return [];
  });
}

export function collectAllTextBlocks(content: ArticleContent): TextBlock[] {
  return Object.values(content.sections).flatMap((items) => {
    if (!items) return [];
    const blocks = items.filter((item): item is ArticleBlock => typeof item === "object");
    return collectTextBlocks(blocks);
  });
}

export function extractHeadings(textBlocks: TextBlock[]): Heading[] {
  return textBlocks.flatMap((block) =>
    block.content
      .split("\n")
      .filter((line) => /^#{1,6} /.test(line))
      .map((line) => {
        const match = line.match(/^(#{1,6}) (.+)$/);
        if (!match) return null;
        const text = match[2].trim();
        return { level: match[1].length, text, id: slugify(text) };
      })
      .filter((h): h is Heading => h !== null),
  );
}

export function parseSources(content: ArticleContent): Source[] {
  const sources: Source[] = [];
  for (const block of collectAllTextBlocks(content)) {
    for (const line of block.content.split("\n")) {
      const match = line.match(/^\[(\d+)\]\s+(.+?):\s*(https?:\/\/\S+)$/);
      if (match) {
        sources.push({ index: Number(match[1]), label: match[2].trim(), url: match[3] });
      }
    }
  }
  return sources.sort((a, b) => a.index - b.index);
}

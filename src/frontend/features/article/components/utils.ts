import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleBlock, TextBlock } from "./types";

export type Heading = { level: number; text: string; id: string };
export type Source = { index: number; id: number | null; label: string; url: string };

export type SourceMaps = {
  byId: Map<number, number>;   // sourceId  → display index
  byUrl: Map<string, number>;  // sourceUrl → display index
};

const CITE_RE = /\[cite:(\d+)\]/g;

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

/** Retorna os IDs das fontes inline na ordem de primeira aparição no conteúdo. */
export function collectInlineCitationIds(content: ArticleContent): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  for (const block of collectAllTextBlocks(content)) {
    CITE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = CITE_RE.exec(block.content)) !== null) {
      const id = Number(match[1]);
      if (!seen.has(id)) {
        seen.add(id);
        ordered.push(id);
      }
    }
  }
  return ordered;
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Constrói a lista unificada de fontes:
 * 1. Citações inline do artigo (por ordem de aparição no content) → numeradas primeiro
 * 2. Fontes de atributos da espécie não repetidas (por URL) → sempre por último
 */
export function computeUnifiedSources(
  content: ArticleContent,
  inlineSources: { id: number; url: string }[],
  attributeSources: { url: string }[],
): Source[] {
  const orderedIds = collectInlineCitationIds(content);
  const idToUrl = new Map(inlineSources.map((s) => [s.id, s.url]));

  const seenUrls = new Set<string>();
  const combined: Source[] = [];
  let nextIndex = 1;

  for (const id of orderedIds) {
    const url = idToUrl.get(id);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    combined.push({ index: nextIndex++, id, label: domainFromUrl(url), url });
  }

  for (const { url } of attributeSources) {
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    combined.push({ index: nextIndex++, id: null, label: domainFromUrl(url), url });
  }

  return combined;
}

export function buildSourceMaps(sources: Source[]): SourceMaps {
  const byId = new Map<number, number>();
  const byUrl = new Map<string, number>();
  for (const src of sources) {
    if (src.id != null) byId.set(src.id, src.index);
    byUrl.set(src.url, src.index);
  }
  return { byId, byUrl };
}

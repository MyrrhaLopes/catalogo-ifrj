import { useState, useEffect } from "react";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleBlock } from "@/frontend/features/article/components/types";

export type DraftDefaultItem = {
  id: string;
  kind: "default";
  name: "TOC" | "SOURCES" | "PROPERTIES";
  disabled: boolean;
};

export type DraftBlockItem = {
  id: string;
  kind: "block";
  block: ArticleBlock;
};

export type DraftItem = DraftDefaultItem | DraftBlockItem;

export type SectionKey = "left" | "center" | "right";

export type DraftSections = Record<SectionKey, DraftItem[]>;

type StorageData = {
  articleId: number | null;
  sections: DraftSections;
};

const DEFAULT_SECTIONS: Record<"TOC" | "SOURCES" | "PROPERTIES", SectionKey> = {
  TOC: "left",
  SOURCES: "center",
  PROPERTIES: "right",
};

const ALL_DEFAULT_NAMES = ["TOC", "SOURCES", "PROPERTIES"] as const;

let idCounter = 0;

export function genDraftId(): string {
  return `draft-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

function initSections(article: { id: number; content: ArticleContent } | null): DraftSections {
  const sections: DraftSections = { left: [], center: [], right: [] };
  const presentDefaults = new Set<string>();

  if (article) {
    for (const key of ["left", "center", "right"] as SectionKey[]) {
      const items = article.content.sections[key] ?? [];
      for (const item of items) {
        if (typeof item === "string") {
          presentDefaults.add(item);
          sections[key].push({
            id: genDraftId(),
            kind: "default",
            name: item as "TOC" | "SOURCES" | "PROPERTIES",
            disabled: false,
          });
        } else {
          sections[key].push({ id: genDraftId(), kind: "block", block: item });
        }
      }
    }
  }

  for (const name of ALL_DEFAULT_NAMES) {
    if (!presentDefaults.has(name)) {
      sections[DEFAULT_SECTIONS[name]].push({
        id: genDraftId(),
        kind: "default",
        name,
        disabled: true,
      });
    }
  }

  return sections;
}

function toDraftContent(sections: DraftSections): ArticleContent {
  function convertSection(items: DraftItem[]) {
    return items
      .filter((item) => item.kind === "block" || !item.disabled)
      .map((item) => (item.kind === "default" ? item.name : item.block));
  }

  return {
    sections: {
      left: convertSection(sections.left),
      center: convertSection(sections.center),
      right: convertSection(sections.right),
    },
  };
}

export function useArticleEditor(
  speciesId: number,
  article: { id: number; content: ArticleContent } | null,
) {
  const storageKey = `article-draft-${speciesId}`;

  const [sections, setSections] = useState<DraftSections>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const stored = JSON.parse(raw) as StorageData;
        if (stored.articleId === (article?.id ?? null) && stored.sections) {
          return stored.sections;
        }
      }
    } catch {
      // ignore parse errors
    }
    return initSections(article);
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ articleId: article?.id ?? null, sections }),
      );
    } catch {
      // ignore storage errors
    }
  }, [sections, storageKey, article?.id]);

  function addItem(section: SectionKey, index: number, item: DraftItem) {
    setSections((prev) => {
      const items = [...prev[section]];
      items.splice(index, 0, item);
      return { ...prev, [section]: items };
    });
  }

  function removeItem(section: SectionKey, id: string) {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  }

  function updateBlockContent(section: SectionKey, id: string, newBlock: ArticleBlock) {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id && item.kind === "block" ? { ...item, block: newBlock } : item,
      ),
    }));
  }

  function toggleDefaultBlock(id: string) {
    setSections((prev) => {
      const next = { ...prev };
      for (const key of ["left", "center", "right"] as SectionKey[]) {
        next[key] = prev[key].map((item) =>
          item.id === id && item.kind === "default"
            ? { ...item, disabled: !item.disabled }
            : item,
        );
      }
      return next;
    });
  }

  function clearDraft() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  return {
    sections,
    setSections,
    addItem,
    removeItem,
    updateBlockContent,
    toggleDefaultBlock,
    toDraftContent: () => toDraftContent(sections),
    clearDraft,
  };
}

import { useState, useEffect } from "react";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type {
  ArticleBlock,
  DefaultBlock,
  DefaultBlockItem,
  SectionItem,
} from "@/frontend/features/article/components/types";
import {
  moveDraftItem,
  type DragPhase,
} from "@/frontend/features/article/components/editor/draftTree";

/** Bloco padrão (TOC/SOURCES/PROPERTIES). Sempre presente no draft; `disabled` = oculto. */
export type DraftDefaultItem = {
  id: string;
  kind: "default";
  name: DefaultBlock;
  disabled: boolean;
};

/**
 * Bloco "folha" (texto/imagem). Dentro de uma coluna pode também carregar uma
 * coluna aninhada legada, mantida opaca (não editável/arrastável por dentro).
 */
export type DraftBlockItem = {
  id: string;
  kind: "block";
  block: ArticleBlock;
};

/** Bloco de coluna: cada sub-coluna é uma lista de filhos com id estável. */
export type DraftColumnItem = {
  id: string;
  kind: "column";
  columns: DraftBlockItem[][];
};

export type DraftItem = DraftDefaultItem | DraftBlockItem | DraftColumnItem;

export type SectionKey = "left" | "center" | "right";

export type DraftSections = Record<SectionKey, DraftItem[]>;

type StorageData = {
  articleId: number | null;
  sections: unknown;
  deletedBlocks?: ArticleBlock[];
};

export const SECTION_KEYS: readonly SectionKey[] = ["left", "center", "right"];

const DEFAULT_SECTIONS: Record<DefaultBlock, SectionKey> = {
  TOC: "left",
  SOURCES: "center",
  PROPERTIES: "right",
};

const ALL_DEFAULT_NAMES = ["TOC", "SOURCES", "PROPERTIES"] as const;

let idCounter = 0;

export function genDraftId(): string {
  return `draft-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

export function extractImageUrlsFromBlock(block: ArticleBlock): string[] {
  if (block.type === "image") return block.content ? [block.content] : [];
  if (block.type === "column") {
    return block.columns.flatMap((col) => col.flatMap(extractImageUrlsFromBlock));
  }
  return [];
}

export function extractDeletedImageUrls(deletedBlocks: ArticleBlock[]): string[] {
  const urls = deletedBlocks.flatMap(extractImageUrlsFromBlock);
  return [...new Set(urls.filter((url) => typeof url === "string" && url.trim().length > 0))];
}

// ---------------------------------------------------------------------------
// Conversão ArticleBlock <-> Draft
// ---------------------------------------------------------------------------

/** Converte um bloco persistido em item de draft (colunas ganham filhos com id). */
export function blockToDraftItem(block: ArticleBlock): DraftBlockItem | DraftColumnItem {
  if (block.type === "column") {
    return {
      id: genDraftId(),
      kind: "column",
      columns: block.columns.map((col) =>
        col.map((child) => ({ id: genDraftId(), kind: "block" as const, block: child })),
      ),
    };
  }
  return { id: genDraftId(), kind: "block", block };
}

/** Converte um item de draft (bloco ou coluna) de volta para o formato persistido. */
export function draftItemToBlock(item: DraftBlockItem | DraftColumnItem): ArticleBlock {
  if (item.kind === "column") {
    return { type: "column", columns: item.columns.map((col) => col.map((c) => c.block)) };
  }
  return item.block;
}

function sectionItemToDraft(item: SectionItem): DraftItem {
  if (typeof item === "string") {
    return { id: genDraftId(), kind: "default", name: item, disabled: false };
  }
  if (item.type === "default") {
    return { id: genDraftId(), kind: "default", name: item.name, disabled: item.disabled };
  }
  return blockToDraftItem(item);
}

/** Garante que cada bloco padrão aparece exatamente uma vez (ausentes entram visíveis). */
function ensureDefaults(sections: DraftSections): DraftSections {
  const seen = new Set<DefaultBlock>();
  const next: DraftSections = { left: [], center: [], right: [] };
  for (const key of SECTION_KEYS) {
    next[key] = sections[key].filter((item) => {
      if (item.kind !== "default") return true;
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  }
  for (const name of ALL_DEFAULT_NAMES) {
    if (!seen.has(name)) {
      next[DEFAULT_SECTIONS[name]].push({ id: genDraftId(), kind: "default", name, disabled: false });
    }
  }
  return next;
}

export function initSections(article: { id: number; content: ArticleContent } | null): DraftSections {
  const sections: DraftSections = { left: [], center: [], right: [] };
  if (article) {
    for (const key of SECTION_KEYS) {
      sections[key] = (article.content.sections[key] ?? []).map(sectionItemToDraft);
    }
  }
  return ensureDefaults(sections);
}

export function toDraftContent(sections: DraftSections): ArticleContent {
  function convertSection(items: DraftItem[]): (ArticleBlock | DefaultBlockItem)[] {
    return items.map((item) =>
      item.kind === "default"
        ? { type: "default", name: item.name, disabled: item.disabled }
        : draftItemToBlock(item),
    );
  }

  return {
    sections: {
      left: convertSection(sections.left),
      center: convertSection(sections.center),
      right: convertSection(sections.right),
    },
  };
}

// ---------------------------------------------------------------------------
// Leitura de draft salvo no localStorage (formato atual ou legado)
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Filho de coluna: mantém o bloco como está (inclusive coluna aninhada opaca). */
function normalizeStoredChild(raw: unknown): DraftBlockItem | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || raw.kind !== "block") return null;
  if (!isRecord(raw.block) || typeof raw.block.type !== "string") return null;
  return { id: raw.id, kind: "block", block: raw.block as ArticleBlock };
}

function normalizeStoredItem(raw: unknown): DraftItem | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;
  if (raw.kind === "default" && typeof raw.name === "string" && raw.name in DEFAULT_SECTIONS) {
    return { id: raw.id, kind: "default", name: raw.name as DefaultBlock, disabled: raw.disabled === true };
  }
  if (raw.kind === "column" && Array.isArray(raw.columns)) {
    const columns: DraftBlockItem[][] = [];
    for (const col of raw.columns as unknown[]) {
      if (!Array.isArray(col)) return null;
      const children = col.map(normalizeStoredChild);
      if (children.some((c) => c === null)) return null;
      columns.push(children as DraftBlockItem[]);
    }
    return { id: raw.id, kind: "column", columns };
  }
  if (raw.kind === "block" && isRecord(raw.block) && typeof raw.block.type === "string") {
    const block = raw.block as ArticleBlock;
    // Draft legado: coluna era um "block" com filhos sem id.
    if (block.type === "column") return { ...blockToDraftItem(block), id: raw.id };
    return { id: raw.id, kind: "block", block };
  }
  return null;
}

/** Valida/migra seções vindas do localStorage. Retorna null se o formato for inválido. */
export function normalizeStoredSections(raw: unknown): DraftSections | null {
  if (!isRecord(raw)) return null;
  const sections: DraftSections = { left: [], center: [], right: [] };
  for (const key of SECTION_KEYS) {
    const items = raw[key];
    if (!Array.isArray(items)) return null;
    for (const item of items) {
      const normalized = normalizeStoredItem(item);
      if (!normalized) return null;
      sections[key].push(normalized);
    }
  }
  return ensureDefaults(sections);
}

function readStorage(storageKey: string, articleId: number | null): StorageData | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StorageData;
    return stored.articleId === articleId ? stored : null;
  } catch {
    return null;
  }
}

export function useArticleEditor(
  speciesId: number,
  article: { id: number; content: ArticleContent } | null,
) {
  const storageKey = `article-draft-${speciesId}`;
  const articleId = article?.id ?? null;

  const [sections, setSections] = useState<DraftSections>(() => {
    const stored = readStorage(storageKey, articleId);
    return normalizeStoredSections(stored?.sections) ?? initSections(article);
  });

  const [deletedBlocks, setDeletedBlocks] = useState<ArticleBlock[]>(() => {
    const stored = readStorage(storageKey, articleId);
    return Array.isArray(stored?.deletedBlocks) ? stored.deletedBlocks : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ articleId, sections, deletedBlocks }));
    } catch {
      // ignore storage errors
    }
  }, [sections, deletedBlocks, storageKey, articleId]);

  function addItem(section: SectionKey, index: number, item: DraftItem) {
    setSections((prev) => {
      const items = [...prev[section]];
      items.splice(index, 0, item);
      return { ...prev, [section]: items };
    });
  }

  function removeItem(section: SectionKey, id: string) {
    const item = sections[section].find((i) => i.id === id);
    if (!item || item.kind === "default") return;
    setDeletedBlocks((d) => [...d, draftItemToBlock(item)]);
    setSections((prev) => ({ ...prev, [section]: prev[section].filter((i) => i.id !== id) }));
  }

  function trackDeletedBlock(block: ArticleBlock) {
    setDeletedBlocks((prev) => [...prev, block]);
  }

  /** Substitui um item (bloco ou coluna) mantendo o mesmo id. */
  function updateItem(section: SectionKey, id: string, next: DraftItem) {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...next, id } : item)),
    }));
  }

  function toggleDefaultBlock(id: string) {
    setSections((prev) => {
      const next = { ...prev };
      for (const key of SECTION_KEYS) {
        next[key] = prev[key].map((item) =>
          item.id === id && item.kind === "default" ? { ...item, disabled: !item.disabled } : item,
        );
      }
      return next;
    });
  }

  /** Move `activeId` para a posição de `overId` (item ou container). Ver `moveDraftItem`. */
  function moveItem(activeId: string, overId: string, phase: DragPhase) {
    setSections((prev) => moveDraftItem(prev, activeId, overId, phase));
  }

  function clearDraft() {
    setDeletedBlocks([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  return {
    sections,
    setSections,
    deletedBlocks,
    trackDeletedBlock,
    addItem,
    removeItem,
    updateItem,
    toggleDefaultBlock,
    moveItem,
    toDraftContent: () => toDraftContent(sections),
    clearDraft,
  };
}

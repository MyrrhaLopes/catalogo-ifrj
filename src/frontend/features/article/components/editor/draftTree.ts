import type { ArticleBlock } from "../types";
import type {
  DraftBlockItem,
  DraftColumnItem,
  DraftItem,
  DraftSections,
  SectionKey,
} from "../../hooks/useArticleEditor";

/**
 * "Container" onde um item de draft pode viver:
 * - uma seção de nível superior (left/center/right), ou
 * - uma sub-coluna (`colIndex`) de um bloco de coluna (`columnId`).
 */
export type ContainerRef =
  | { kind: "section"; section: SectionKey }
  | { kind: "column"; columnId: string; colIndex: number };

export type ItemLocation = { container: ContainerRef; index: number; item: DraftItem };

/**
 * Fase do drag: em "over" só movemos entre containers diferentes; em "end" só
 * reordenamos dentro do mesmo container; "any" faz os dois (útil em testes).
 */
export type DragPhase = "over" | "end" | "any";

const SECTIONS: readonly SectionKey[] = ["left", "center", "right"];
const COLUMN_PREFIX = "column:";

export function columnContainerId(columnId: string, colIndex: number): string {
  return `${COLUMN_PREFIX}${columnId}:${colIndex}`;
}

export function isColumnContainerId(id: string): boolean {
  return id.startsWith(COLUMN_PREFIX);
}

export function isSectionKey(id: string): id is SectionKey {
  return (SECTIONS as readonly string[]).includes(id);
}

/** Só blocos de texto/imagem podem entrar em uma coluna. */
export function isLeafItem(item: DraftItem): item is DraftBlockItem {
  return item.kind === "block" && (item.block.type === "text" || item.block.type === "image");
}

export function findItemLocation(sections: DraftSections, id: string): ItemLocation | null {
  for (const section of SECTIONS) {
    const items = sections[section];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item.id === id) return { container: { kind: "section", section }, index, item };
      if (item.kind !== "column") continue;
      for (let colIndex = 0; colIndex < item.columns.length; colIndex++) {
        const childIndex = item.columns[colIndex].findIndex((c) => c.id === id);
        if (childIndex >= 0) {
          return {
            container: { kind: "column", columnId: item.id, colIndex },
            index: childIndex,
            item: item.columns[colIndex][childIndex],
          };
        }
      }
    }
  }
  return null;
}

function findColumn(sections: DraftSections, columnId: string): DraftColumnItem | null {
  const loc = findItemLocation(sections, columnId);
  return loc && loc.item.kind === "column" ? loc.item : null;
}

/** Converte um id de droppable (seção ou sub-coluna) em ContainerRef. */
export function resolveContainerId(sections: DraftSections, id: string): ContainerRef | null {
  if (isSectionKey(id)) return { kind: "section", section: id };
  if (!isColumnContainerId(id)) return null;
  const rest = id.slice(COLUMN_PREFIX.length);
  const sep = rest.lastIndexOf(":");
  if (sep <= 0) return null;
  const columnId = rest.slice(0, sep);
  const colIndex = Number(rest.slice(sep + 1));
  const column = findColumn(sections, columnId);
  if (!column || !Number.isInteger(colIndex) || colIndex < 0 || colIndex >= column.columns.length) {
    return null;
  }
  return { kind: "column", columnId, colIndex };
}

function sameContainer(a: ContainerRef, b: ContainerRef): boolean {
  if (a.kind === "section" && b.kind === "section") return a.section === b.section;
  if (a.kind === "column" && b.kind === "column") {
    return a.columnId === b.columnId && a.colIndex === b.colIndex;
  }
  return false;
}

function getContainerItems(sections: DraftSections, ref: ContainerRef): DraftItem[] {
  if (ref.kind === "section") return sections[ref.section];
  return findColumn(sections, ref.columnId)?.columns[ref.colIndex] ?? [];
}

function updateContainer(
  sections: DraftSections,
  ref: ContainerRef,
  fn: (items: DraftItem[]) => DraftItem[],
): DraftSections {
  if (ref.kind === "section") return { ...sections, [ref.section]: fn(sections[ref.section]) };
  const next = { ...sections };
  for (const section of SECTIONS) {
    next[section] = sections[section].map((item) =>
      item.kind === "column" && item.id === ref.columnId
        ? {
            ...item,
            columns: item.columns.map((col, i) =>
              i === ref.colIndex ? (fn(col) as DraftBlockItem[]) : col,
            ),
          }
        : item,
    );
  }
  return next;
}

export function arrayMoveSafe<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
  return next;
}

/**
 * Move o item `activeId` para a posição de `overId`. `overId` pode ser o id de
 * outro item (insere na posição dele) ou o id de um container (insere no fim).
 * Retorna o mesmo objeto `sections` quando o movimento é inválido/ignorado
 * (ex: bloco padrão ou coluna sendo arrastado para dentro de uma coluna).
 */
export function moveDraftItem(
  sections: DraftSections,
  activeId: string,
  overId: string,
  phase: DragPhase = "any",
): DraftSections {
  if (activeId === overId) return sections;
  const from = findItemLocation(sections, activeId);
  if (!from) return sections;

  const overLoc = findItemLocation(sections, overId);
  const target = overLoc?.container ?? resolveContainerId(sections, overId);
  if (!target) return sections;
  const overIndex = overLoc ? overLoc.index : null;

  if (target.kind === "column" && !isLeafItem(from.item)) return sections;

  const same = sameContainer(from.container, target);
  if ((phase === "over" && same) || (phase === "end" && !same)) return sections;

  if (same) {
    const items = getContainerItems(sections, target);
    const toIndex = overIndex ?? items.length - 1;
    if (toIndex === from.index) return sections;
    return updateContainer(sections, target, (list) => arrayMoveSafe(list, from.index, toIndex));
  }

  const removed = updateContainer(sections, from.container, (list) =>
    list.filter((i) => i.id !== activeId),
  );
  return updateContainer(removed, target, (list) => {
    const next = [...list];
    next.splice(overIndex ?? next.length, 0, from.item);
    return next;
  });
}

// ---------------------------------------------------------------------------
// Operações sobre um único bloco de coluna (usadas pelo ColumnBlockEditor)
// ---------------------------------------------------------------------------

/** Insere `item` na sub-coluna. Retorna a mesma coluna se o item não for texto/imagem. */
export function insertIntoColumn(
  column: DraftColumnItem,
  colIndex: number,
  index: number,
  item: DraftItem,
): DraftColumnItem {
  if (!isLeafItem(item) || colIndex < 0 || colIndex >= column.columns.length) return column;
  return {
    ...column,
    columns: column.columns.map((col, i) => {
      if (i !== colIndex) return col;
      const next = [...col];
      next.splice(index, 0, item);
      return next;
    }),
  };
}

export function removeFromColumn(
  column: DraftColumnItem,
  childId: string,
): { column: DraftColumnItem; removed: DraftBlockItem | null } {
  const removed = column.columns.flat().find((c) => c.id === childId) ?? null;
  if (!removed) return { column, removed: null };
  return {
    column: { ...column, columns: column.columns.map((col) => col.filter((c) => c.id !== childId)) },
    removed,
  };
}

export function updateInColumn(
  column: DraftColumnItem,
  childId: string,
  block: ArticleBlock,
): DraftColumnItem {
  return {
    ...column,
    columns: column.columns.map((col) => col.map((c) => (c.id === childId ? { ...c, block } : c))),
  };
}

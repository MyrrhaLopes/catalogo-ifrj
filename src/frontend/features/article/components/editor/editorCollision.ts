import { pointerWithin, type CollisionDetection } from "@dnd-kit/core";
import type { DraftSections } from "../../hooks/useArticleEditor";
import { findItemLocation, isColumnContainerId, isLeafItem, isSectionKey } from "./draftTree";

/**
 * Collision detection para o editor com containers aninhados.
 *
 * `pointerWithin` devolve todos os droppables sob o ponteiro (seção, bloco de
 * coluna, sub-coluna, filhos...). Aqui priorizamos o mais "profundo":
 * filho de coluna > sub-coluna > item de nível superior > seção.
 * Itens que não podem entrar em coluna (defaults e colunas) ignoram os alvos
 * internos de colunas.
 */
export function createEditorCollisionDetection(getSections: () => DraftSections): CollisionDetection {
  return (args) => {
    const sections = getSections();
    const active = findItemLocation(sections, String(args.active.id));
    const canEnterColumn = active ? isLeafItem(active.item) : false;

    function rank(id: string): number {
      if (isSectionKey(id)) return 3;
      if (isColumnContainerId(id)) return 1;
      const loc = findItemLocation(sections, id);
      if (!loc) return 4;
      return loc.container.kind === "column" ? 0 : 2;
    }

    return pointerWithin(args)
      .map((collision) => ({ collision, rank: rank(String(collision.id)) }))
      .filter(({ rank: r }) => r < 4 && (canEnterColumn || (r !== 0 && r !== 1)))
      .sort((a, b) => a.rank - b.rank)
      .map(({ collision }) => collision);
  };
}

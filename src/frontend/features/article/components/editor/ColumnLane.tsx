import { Fragment } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type { ArticleBlock } from "../types";
import type { DraftBlockItem, DraftItem } from "../../hooks/useArticleEditor";
import { BlockInsertZone } from "./BlockInsertZone";
import { ColumnChildItem } from "./ColumnChildItem";
import { columnContainerId } from "./draftTree";

type Props = {
  columnId: string;
  colIndex: number;
  items: DraftBlockItem[];
  speciesId: number;
  onAdd: (index: number, item: DraftItem) => void;
  onRemove: (childId: string) => void;
  onUpdate: (childId: string, block: ArticleBlock) => void;
};

/** Uma sub-coluna de um bloco de coluna: droppable + lista ordenável própria. */
export function ColumnLane({ columnId, colIndex, items, speciesId, onAdd, onRemove, onUpdate }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columnContainerId(columnId, colIndex) });

  return (
    <div className="flex-1 min-w-0 border-r border-input last:border-0 pr-2 last:pr-0">
      <p className="text-[10px] text-muted-foreground mb-1 px-1">Coluna {colIndex + 1}</p>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn("min-h-[40px] rounded transition-colors", isOver && "bg-primary/5")}
        >
          <BlockInsertZone onAdd={(item) => onAdd(0, item)} options={["text", "image"]} />
          {items.map((child, index) => (
            <Fragment key={child.id}>
              <ColumnChildItem
                item={child}
                speciesId={speciesId}
                onRemove={() => onRemove(child.id)}
                onUpdate={(block) => onUpdate(child.id, block)}
              />
              <BlockInsertZone onAdd={(item) => onAdd(index + 1, item)} options={["text", "image"]} />
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

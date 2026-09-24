import { Fragment } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DraftItem, SectionKey } from "../../hooks/useArticleEditor";
import type { ArticleBlock } from "../types";
import { BlockInsertZone } from "./BlockInsertZone";
import { EditorBlockItem } from "./EditorBlockItem";

type Props = {
  sectionKey: SectionKey;
  items: DraftItem[];
  onAdd: (index: number, item: DraftItem) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, block: ArticleBlock) => void;
  onToggleDefault: (id: string) => void;
};

export function ArticleEditorSection({ sectionKey, items, onAdd, onRemove, onUpdate, onToggleDefault }: Props) {
  const { setNodeRef } = useDroppable({ id: sectionKey });

  return (
    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="min-h-[60px]">
        <BlockInsertZone onAdd={(item) => onAdd(0, item)} />
        {items.map((item, i) => (
          <Fragment key={item.id}>
            <EditorBlockItem
              item={item}
              sectionKey={sectionKey}
              onRemove={() => onRemove(item.id)}
              onUpdate={(block) => onUpdate(item.id, block)}
              onToggleDefault={() => onToggleDefault(item.id)}
            />
            <BlockInsertZone onAdd={(newItem) => onAdd(i + 1, newItem)} />
          </Fragment>
        ))}
      </div>
    </SortableContext>
  );
}

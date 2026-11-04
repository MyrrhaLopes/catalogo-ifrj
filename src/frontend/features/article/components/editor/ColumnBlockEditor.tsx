import type { ArticleBlock } from "../types";
import type { DraftColumnItem } from "../../hooks/useArticleEditor";
import { insertIntoColumn, removeFromColumn, updateInColumn } from "./draftTree";
import { ColumnLane } from "./ColumnLane";

type Props = {
  item: DraftColumnItem;
  speciesId: number;
  onChange: (item: DraftColumnItem) => void;
  onDeleteBlock?: (block: ArticleBlock) => void;
};

export function ColumnBlockEditor({ item, speciesId, onChange, onDeleteBlock }: Props) {
  function handleRemove(childId: string) {
    const { column, removed } = removeFromColumn(item, childId);
    if (!removed) return;
    onDeleteBlock?.(removed.block);
    onChange(column);
  }

  return (
    <div className="flex gap-2 rounded border border-input bg-muted/20 p-2">
      {item.columns.map((children, colIndex) => (
        <ColumnLane
          key={colIndex}
          columnId={item.id}
          colIndex={colIndex}
          items={children}
          speciesId={speciesId}
          onAdd={(index, child) => onChange(insertIntoColumn(item, colIndex, index, child))}
          onRemove={handleRemove}
          onUpdate={(childId, block) => onChange(updateInColumn(item, childId, block))}
        />
      ))}
    </div>
  );
}

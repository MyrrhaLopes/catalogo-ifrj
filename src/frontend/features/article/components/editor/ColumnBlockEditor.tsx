import { X } from "lucide-react";
import type { ColumnBlock, ArticleBlock } from "../types";
import { Button } from "@/frontend/components/ui/button";
import { BlockInsertZone } from "./BlockInsertZone";
import type { DraftItem } from "../../hooks/useArticleEditor";
import { TextBlockEditor } from "./TextBlockEditor";
import { ImageBlockEditor } from "./ImageBlockEditor";

type Props = {
  block: ColumnBlock;
  onChange: (block: ColumnBlock) => void;
};

export function ColumnBlockEditor({ block, onChange }: Props) {
  function addToColumn(colIndex: number, insertAt: number, item: DraftItem) {
    if (item.kind !== "block" || item.block.type === "column") return;
    const newColumns = block.columns.map((col, i) => {
      if (i !== colIndex) return col;
      const next = [...col];
      next.splice(insertAt, 0, item.block);
      return next;
    });
    onChange({ ...block, columns: newColumns });
  }

  function removeFromColumn(colIndex: number, blockIndex: number) {
    const newColumns = block.columns.map((col, i) => {
      if (i !== colIndex) return col;
      return col.filter((_, j) => j !== blockIndex);
    });
    onChange({ ...block, columns: newColumns });
  }

  function updateInColumn(colIndex: number, blockIndex: number, newBlock: ArticleBlock) {
    const newColumns = block.columns.map((col, i) => {
      if (i !== colIndex) return col;
      return col.map((b, j) => (j === blockIndex ? newBlock : b));
    });
    onChange({ ...block, columns: newColumns });
  }

  return (
    <div className="flex gap-2 rounded border border-input bg-muted/20 p-2">
      {block.columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 min-w-0 border-r border-input last:border-0 pr-2 last:pr-0">
          <p className="text-[10px] text-muted-foreground mb-1 px-1">Coluna {colIndex + 1}</p>
          <BlockInsertZone
            onAdd={(item) => addToColumn(colIndex, 0, item)}
            options={["text", "image"]}
          />
          {col.map((b, blockIndex) => (
            <div key={blockIndex}>
              <div className="group relative flex gap-1 items-start">
                <div className="flex-1 min-w-0">
                  {b.type === "text" ? (
                    <TextBlockEditor
                      block={b}
                      onChange={(nb) => updateInColumn(colIndex, blockIndex, nb)}
                    />
                  ) : b.type === "image" ? (
                    <ImageBlockEditor
                      block={b}
                      onChange={(nb) => updateInColumn(colIndex, blockIndex, nb)}
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground p-2 border border-dashed rounded">
                      Coluna aninhada
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 mt-1"
                  onClick={() => removeFromColumn(colIndex, blockIndex)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <BlockInsertZone
                onAdd={(item) => addToColumn(colIndex, blockIndex + 1, item)}
                options={["text", "image"]}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


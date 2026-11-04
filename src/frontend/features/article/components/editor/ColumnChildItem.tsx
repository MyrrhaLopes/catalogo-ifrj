import { Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";
import type { ArticleBlock } from "../types";
import type { DraftBlockItem } from "../../hooks/useArticleEditor";
import { TextBlockEditor } from "./TextBlockEditor";
import { ImageBlockEditor } from "./ImageBlockEditor";
import { DragHandle } from "./DragHandle";

type Props = {
  item: DraftBlockItem;
  speciesId: number;
  onRemove: () => void;
  onUpdate: (block: ArticleBlock) => void;
};

/** Filho de uma sub-coluna, ordenável e arrastável para fora da coluna. */
export function ColumnChildItem({ item, speciesId, onRemove, onUpdate }: Props) {
  const { block } = item;
  // Colunas aninhadas (dados legados) ficam opacas: não podem ser arrastadas.
  const isNestedColumn = block.type === "column";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isNestedColumn,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative flex gap-1 items-start", isDragging && "opacity-40 z-50")}
    >
      {!isNestedColumn && <DragHandle size="sm" {...attributes} {...listeners} />}
      <div className="flex-1 min-w-0">
        {block.type === "text" ? (
          <TextBlockEditor block={block} onChange={onUpdate} />
        ) : block.type === "image" ? (
          <ImageBlockEditor block={block} speciesId={speciesId} onChange={onUpdate} />
        ) : (
          <div className="text-xs text-muted-foreground p-2 border border-dashed rounded">
            Coluna aninhada
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-1"
        title="Excluir bloco da coluna"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

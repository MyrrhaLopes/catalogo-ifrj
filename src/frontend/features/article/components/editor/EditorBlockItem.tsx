import { Eye, EyeOff, FileText, Database, List, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";
import type { DraftItem } from "../../hooks/useArticleEditor";
import type { ArticleBlock } from "../types";
import { TextBlockEditor } from "./TextBlockEditor";
import { ImageBlockEditor } from "./ImageBlockEditor";
import { ColumnBlockEditor } from "./ColumnBlockEditor";
import { DragHandle } from "./DragHandle";

const DEFAULT_BLOCK_META = {
  TOC: { label: "Índice (TOC)", Icon: List },
  SOURCES: { label: "Fontes (SOURCES)", Icon: FileText },
  PROPERTIES: { label: "Propriedades da espécie", Icon: Database },
} as const;

type Props = {
  item: DraftItem;
  speciesId: number;
  onRemove: () => void;
  onUpdate: (next: DraftItem) => void;
  onToggleDefault: () => void;
  onDeleteNestedBlock?: (block: ArticleBlock) => void;
};

export function EditorBlockItem({
  item,
  speciesId,
  onRemove,
  onUpdate,
  onToggleDefault,
  onDeleteNestedBlock,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDefault = item.kind === "default";
  const isDisabled = isDefault && item.disabled;

  return (
    <div ref={setNodeRef} style={style} className={cn("group relative", isDragging && "opacity-40 z-50")}>
      <div className="flex items-start gap-1">
        <DragHandle {...attributes} {...listeners} />

        <div className={cn("flex-1 min-w-0 py-1", isDisabled && "opacity-40")}>
          {item.kind === "default" ? (
            <DefaultBlockDisplay name={item.name} />
          ) : item.kind === "column" ? (
            <ColumnBlockEditor
              item={item}
              speciesId={speciesId}
              onChange={onUpdate}
              onDeleteBlock={onDeleteNestedBlock}
            />
          ) : item.block.type === "text" ? (
            <TextBlockEditor block={item.block} onChange={(block) => onUpdate({ ...item, block })} />
          ) : item.block.type === "image" ? (
            <ImageBlockEditor
              block={item.block}
              speciesId={speciesId}
              onChange={(block) => onUpdate({ ...item, block })}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 mt-1">
          {isDefault ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              title={isDisabled ? "Tornar visível" : "Ocultar bloco"}
              onClick={onToggleDefault}
            >
              {isDisabled ? (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Excluir bloco"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DefaultBlockDisplay({ name }: { name: "TOC" | "SOURCES" | "PROPERTIES" }) {
  const { label, Icon } = DEFAULT_BLOCK_META[name];
  return (
    <div className="flex items-center gap-2 rounded border border-dashed border-muted-foreground/40 px-3 py-2 text-sm text-muted-foreground bg-muted/20 select-none">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

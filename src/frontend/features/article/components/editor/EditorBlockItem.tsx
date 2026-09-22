import { useState } from "react";
import { GripVertical, Eye, EyeOff, Trash2, FileText, Database, List } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/frontend/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/frontend/components/ui/alert-dialog";
import { buttonVariants } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/shared/utils";
import type { DraftItem, SectionKey } from "../../hooks/useArticleEditor";
import type { ArticleBlock } from "../types";
import { TextBlockEditor } from "./TextBlockEditor";
import { ImageBlockEditor } from "./ImageBlockEditor";
import { ColumnBlockEditor } from "./ColumnBlockEditor";

const DEFAULT_BLOCK_META = {
  TOC: { label: "Índice (TOC)", Icon: List },
  SOURCES: { label: "Fontes (SOURCES)", Icon: FileText },
  PROPERTIES: { label: "Propriedades da espécie", Icon: Database },
} as const;

type Props = {
  item: DraftItem;
  sectionKey: SectionKey;
  onRemove: () => void;
  onUpdate: (block: ArticleBlock) => void;
  onToggleDefault: () => void;
};

export function EditorBlockItem({ item, sectionKey: _sectionKey, onRemove, onUpdate, onToggleDefault }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

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
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground p-0.5 mt-1 shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </span>

        <div className={cn("flex-1 min-w-0 py-1", isDisabled && "opacity-40")}>
          {isDefault ? (
            <DefaultBlockDisplay name={item.name} />
          ) : item.block.type === "text" ? (
            <TextBlockEditor block={item.block} onChange={onUpdate} />
          ) : item.block.type === "image" ? (
            <ImageBlockEditor block={item.block} onChange={onUpdate} />
          ) : (
            <ColumnBlockEditor
              block={item.block}
              onChange={onUpdate}
            />
          )}
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
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  title="Remover bloco"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={() => { setDeleteOpen(false); onRemove(); }}
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

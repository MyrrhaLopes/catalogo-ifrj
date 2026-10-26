import { AlertTriangle, FileText, ImageIcon, Columns3, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import type { ArticleBlock } from "../types";
import { extractImageUrlsFromBlock } from "@/frontend/features/article/hooks/useArticleEditor";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedBlocks: ArticleBlock[];
  isSaving: boolean;
  onConfirm: () => void;
};

export function SaveArticleConfirmDialog({
  open,
  onOpenChange,
  deletedBlocks,
  isSaving,
  onConfirm,
}: Props) {
  const hasDeletedBlocks = deletedBlocks.length > 0;
  const deletedImageUrls = deletedBlocks.flatMap(extractImageUrlsFromBlock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {hasDeletedBlocks ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            ) : (
              <Trash2 className="h-5 w-5 text-primary shrink-0" />
            )}
            <DialogTitle>Salvar alterações do artigo</DialogTitle>
          </div>
          <DialogDescription>
            {hasDeletedBlocks
              ? "Confira os blocos que foram removidos durante a edição e serão excluídos definitivamente ao salvar."
              : "Nenhum bloco foi excluído do artigo. Deseja confirmar e publicar as alterações?"}
          </DialogDescription>
        </DialogHeader>

        {hasDeletedBlocks && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Blocos a serem excluídos ({deletedBlocks.length})
              </span>
              {deletedImageUrls.length > 0 && (
                <span className="text-destructive font-medium">
                  {deletedImageUrls.length} imagem(ns) no bucket
                </span>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-2 bg-muted/20">
              {deletedBlocks.map((block, idx) => (
                <DeletedBlockItem key={idx} block={block} />
              ))}
            </div>

            {deletedImageUrls.length > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> As imagens vinculadas aos blocos excluídos serão removidas
                  permanentemente do bucket de armazenamento e da galeria ao confirmar.
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant={hasDeletedBlocks ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? "Salvando…" : hasDeletedBlocks ? "Confirmar e salvar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeletedBlockItem({ block }: { block: ArticleBlock }) {
  if (block.type === "text") {
    const preview = block.content.trim().slice(0, 120);
    return (
      <div className="flex items-start gap-2.5 p-2 rounded bg-background border text-xs">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-700">
              Texto
            </span>
          </div>
          <p className="text-muted-foreground line-clamp-2 italic">
            {preview || "(bloco de texto vazio)"}
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="flex items-start gap-2.5 p-2 rounded bg-background border text-xs">
        <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        {block.content && (
          <img
            src={block.content}
            alt="Miniatura"
            className="h-10 w-10 object-cover rounded border shrink-0 bg-muted"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-700">
              Imagem
            </span>
            <span className="text-[10px] text-destructive font-medium">Exclui do bucket</span>
          </div>
          <p className="text-muted-foreground truncate" title={block.content}>
            {block.content || "(URL vazia)"}
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "column") {
    const nestedImages = extractImageUrlsFromBlock(block);
    const totalBlocks = block.columns.reduce((acc, col) => acc + col.length, 0);

    return (
      <div className="flex items-start gap-2.5 p-2 rounded bg-background border text-xs">
        <Columns3 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-700">
              Colunas
            </span>
            {nestedImages.length > 0 && (
              <span className="text-[10px] text-destructive font-medium">
                {nestedImages.length} imagem(ns) no bucket
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {block.columns.length} colunas com {totalBlocks} bloco(s) interno(s)
          </p>
        </div>
      </div>
    );
  }

  return null;
}

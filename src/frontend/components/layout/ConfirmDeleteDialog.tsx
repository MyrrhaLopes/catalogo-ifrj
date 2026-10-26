import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type ConfirmTextProps = {
  value: string;
  onChange: (value: string) => void;
  expected: string;
};

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  items?: string[];
  isLoadingImpact?: boolean;
  isPending?: boolean;
  confirmLabel?: string;
  confirmText?: ConfirmTextProps;
  onConfirm: () => void;
};

// Dialog padrão de confirmação de exclusão da aplicação. Usado tanto para
// exclusões simples quanto para exclusões com impacto em outros registros
// (via `items`) ou que exigem digitar um texto de confirmação (via `confirmText`).
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  isLoadingImpact,
  isPending,
  confirmLabel = "Excluir",
  confirmText,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const confirmDisabled =
    isLoadingImpact || isPending || (confirmText != null && confirmText.value !== confirmText.expected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!isLoadingImpact && items && items.length > 0 && (
          <ul className="text-sm space-y-1.5 border rounded-md p-3 bg-muted/50 text-left">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {confirmText && (
          <Input
            value={confirmText.value}
            onChange={(e) => confirmText.onChange(e.target.value)}
            placeholder={confirmText.expected}
          />
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={confirmDisabled} onClick={onConfirm}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { deleteAccount } from "@/frontend/shared/api/users";
import { router } from "@/frontend/router";

const CONFIRM_PHRASE = "Confirmo que desejo deletar minha conta";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setConfirmText("");
  };

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      queryClient.setQueryData(["auth", "current_user"], null);
      await router.invalidate();
      void navigate({ to: "/login" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Apagar conta</DialogTitle>
          <DialogDescription>
            Esta ação é permanente e não pode ser desfeita. Todas as suas
            tarefas serão deletadas junto com a conta.
            <br />
            <br />
            Para confirmar, digite exatamente:
            <br />
            <span className="font-medium text-foreground">
              "{CONFIRM_PHRASE}"
            </span>
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_PHRASE}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
            className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? "Apagando..." : "Apagar conta"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

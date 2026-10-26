import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteDialog } from "@/frontend/components/layout/ConfirmDeleteDialog";
import { deleteAccount } from "@/frontend/shared/api/users";

const CONFIRM_PHRASE = "Confirmo que desejo deletar minha conta";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const router = useRouter();
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
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Apagar conta"
      description={
        <>
          Esta ação é permanente e não pode ser desfeita. Todas as suas
          tarefas serão deletadas junto com a conta.
          <br />
          <br />
          Para confirmar, digite exatamente:
          <br />
          <span className="font-medium text-foreground">"{CONFIRM_PHRASE}"</span>
        </>
      }
      confirmText={{ value: confirmText, onChange: setConfirmText, expected: CONFIRM_PHRASE }}
      confirmLabel={isDeleting ? "Apagando..." : "Apagar conta"}
      isPending={isDeleting}
      onConfirm={handleDelete}
    />
  );
}

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "@/frontend/shared/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { logoutUser, deleteAccount } from "@/frontend/shared/api/users";
import { router } from "@/frontend/router";

const CONFIRM_PHRASE = "Confirmo que desejo deletar minha conta";

export function AppHeader() {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    queryClient.setQueryData(["auth", "current_user"], null);
    await router.invalidate();
    navigate({ to: "/login" });
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      queryClient.setQueryData(["auth", "current_user"], null);
      await router.invalidate();
      navigate({ to: "/login" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setConfirmText("");
  };

  return (
    <header className="h-12 bg-neutral-800 flex items-center px-6">
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white underline text-sm hover:text-neutral-300 transition-colors">
              {user?.email}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={handleLogout}
              className="cursor-pointer"
            >
              Deslogar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              Apagar conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDialogOpenChange}>
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
              onClick={() => handleDialogOpenChange(false)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? "Apagando..." : "Apagar conta"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

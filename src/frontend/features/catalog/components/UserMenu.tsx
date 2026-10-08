import { useState } from "react";
import { UserCircle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Button } from "@/frontend/components/ui/button";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { logoutUser } from "@/frontend/shared/api/users";
import { router } from "@/frontend/router";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export function UserMenu() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    queryClient.setQueryData(["auth", "current_user"], null);
    await router.invalidate();
    void navigate({ to: "/login" });
  };

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" asChild className="bg-white/80 border-white/60 text-green-900 hover:bg-white hover:text-green-900">
          <Link to="/login">Entrar</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="bg-white/80 text-green-900 hover:bg-white hover:text-green-900">
          <Link to="/register">Criar conta</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-white/80 text-green-900 hover:bg-white hover:text-green-900">
            <UserCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/favoritos">Meus Favoritos</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/editar-usuario">Editar Usuário</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
            Sair
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

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

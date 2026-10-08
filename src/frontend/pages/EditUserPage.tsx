import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { updateUser } from "../shared/api/users";
import { toast } from "sonner";
import useAuth from "../shared/hooks/useAuth";

export const editUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editar-usuario",
  component: EditUserPage,
});

function EditUserPage() {
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    const updates: { name?: string; password?: string } = {};
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== (user?.name ?? ""))
      updates.name = trimmedName;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      toast.warning("Nenhuma alteração detectada.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(updates);
      await queryClient.invalidateQueries({
        queryKey: ["auth", "current_user"],
      });
      toast.success("Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell className="bg-white">
      <main className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          Editar Usuário
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </div>

          {password && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>
          )}

          <Button type="submit" disabled={isSaving} className="self-start">
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </main>
    </PageShell>
  );
}

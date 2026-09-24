import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import useLoginUser from "../shared/hooks/useLoginUser";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../shared/hooks/useAuth";
import { useEffect } from "react";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

export function LoginPage() {
  const { mutate, isPending, error } = useLoginUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate({ to: '/' });
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget);
    mutate(
      { email: form.get('email') as string, password: form.get('password') as string },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['auth', 'current_user'] });
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar o catálogo
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error.message}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              Entrar
            </Button>

            <p className="text-sm text-neutral-500 text-center">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-neutral-900 font-medium underline underline-offset-4 hover:text-neutral-700"
              >
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

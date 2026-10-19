import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { LoginForm } from "@/frontend/features/auth/components/LoginForm";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  return (
    <PageShell className="bg-neutral-100">
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar o catálogo
            </CardDescription>
          </CardHeader>
          <LoginForm />
        </Card>
      </div>
    </PageShell>
  );
}

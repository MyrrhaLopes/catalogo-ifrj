import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { RegisterForm } from "@/frontend/features/auth/components/RegisterForm";

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <PageShell className="bg-neutral-100">
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para se cadastrar
            </CardDescription>
          </CardHeader>
          <RegisterForm />
        </Card>
      </div>
    </PageShell>
  );
}

import { Link } from "@tanstack/react-router";
import { Button } from "@/frontend/components/ui/button";
import { CardContent, CardFooter } from "@/frontend/components/ui/card";
import { useLoginForm } from "../hooks/useLoginForm";
import { FormField } from "./FormField";
import { FormErrorAlert } from "./FormErrorAlert";
import { PasswordRequirements } from "./PasswordRequirements";

export function LoginForm() {
  const { fieldProps, fieldErrors, formError, isPending, onSubmit } = useLoginForm();

  return (
    <form onSubmit={onSubmit} noValidate>
      <CardContent className="space-y-4">
        <FormField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          error={fieldErrors.email}
          {...fieldProps("email")}
        />
        <FormField
          id="password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={fieldErrors.password}
          hint={<PasswordRequirements title="Lembrete: sua senha contém" />}
          {...fieldProps("password")}
        />
        <FormErrorAlert message={formError} />
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
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
  );
}

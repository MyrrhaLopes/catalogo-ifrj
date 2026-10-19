import { Link } from "@tanstack/react-router";
import { Button } from "@/frontend/components/ui/button";
import { CardContent, CardFooter } from "@/frontend/components/ui/card";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { FormField } from "./FormField";
import { FormErrorAlert } from "./FormErrorAlert";
import { PasswordRequirements } from "./PasswordRequirements";

export function RegisterForm() {
  const {
    fieldProps,
    fieldErrors,
    passwordInvalid,
    formError,
    password,
    showPasswordErrors,
    isPending,
    onSubmit,
  } = useRegisterForm();

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
          autoComplete="new-password"
          placeholder="••••••••"
          error={fieldErrors.password}
          invalid={passwordInvalid}
          hint={<PasswordRequirements password={password} showErrors={showPasswordErrors} />}
          {...fieldProps("password")}
        />
        <FormField
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={fieldErrors.confirmPassword}
          {...fieldProps("confirmPassword")}
        />
        <FormErrorAlert message={formError} />
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Criando conta..." : "Criar conta"}
        </Button>
        <p className="text-sm text-neutral-500 text-center">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="text-neutral-900 font-medium underline underline-offset-4 hover:text-neutral-700"
          >
            Entrar
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

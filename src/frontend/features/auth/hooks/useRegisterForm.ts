import { useNavigate } from "@tanstack/react-router";
import { useRegisterUser } from "@/frontend/shared/hooks/useRegisterUser";
import { REGISTER_FIELDS, validateRegisterForm } from "../auth.validation";
import { resolveServerError } from "../auth.errors";
import { useValidatedForm } from "./useValidatedForm";

export function useRegisterForm() {
  const navigate = useNavigate();
  const mutation = useRegisterUser();

  const form = useValidatedForm(
    { email: "", password: "", confirmPassword: "" },
    validateRegisterForm,
    {
      onChange: () => {
        if (mutation.isError) mutation.reset();
      },
    },
  );

  const serverError = resolveServerError(mutation.error, REGISTER_FIELDS, {
    fieldByStatus: { 409: "email" },
    fallbackMessage: "Não foi possível criar a conta. Tente novamente.",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      { email: values.email.trim(), password: values.password },
      { onSuccess: () => navigate({ to: "/login" }) },
    );
  });

  const { password: passwordError, ...clientErrors } = form.errors;

  return {
    fieldProps: form.fieldProps,
    fieldErrors: { ...serverError.fieldErrors, ...clientErrors },
    // O erro de senha do cliente não vira texto: o checklist de requisitos já o detalha.
    passwordInvalid: Boolean(passwordError ?? serverError.fieldErrors.password),
    formError: serverError.message,
    password: form.values.password,
    showPasswordErrors: form.submitted || Boolean(form.touched.password),
    isPending: mutation.isPending,
    onSubmit,
  };
}

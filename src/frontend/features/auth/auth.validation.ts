import {
  PASSWORD_RULES,
  userLoginSchema,
  type PasswordRule,
} from "@/backend/http/features/users/user.schema";

export const LOGIN_FIELDS = ["email", "password"] as const;
export const REGISTER_FIELDS = ["email", "password", "confirmPassword"] as const;

export type LoginField = (typeof LOGIN_FIELDS)[number];
export type RegisterField = (typeof REGISTER_FIELDS)[number];
export type FormValues<F extends string> = Record<F, string>;
export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Informe o e-mail";
  if (!userLoginSchema.shape.email.safeParse(value).success) {
    return "Não é um e-mail válido";
  }
  return undefined;
}

export function getUnmetPasswordRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

// O detalhe de cada requisito é exibido pelo checklist (PasswordRequirements);
// esta mensagem serve para bloquear o envio e marcar o campo como inválido.
export function validatePassword(password: string): string | undefined {
  if (!password) return "Informe a senha";
  if (getUnmetPasswordRules(password).length > 0) return "A senha não atende aos requisitos";
  return undefined;
}

export function validateLoginForm(values: FormValues<LoginField>): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const password = validatePassword(values.password);
  if (password) errors.password = password;
  return errors;
}

export function validateRegisterForm(
  values: FormValues<RegisterField>,
): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const password = validatePassword(values.password);
  if (password) errors.password = password;
  if (!values.confirmPassword) errors.confirmPassword = "Confirme a senha";
  else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem";
  }
  return errors;
}

export function hasFieldErrors<F extends string>(errors: FieldErrors<F>): boolean {
  return Object.values(errors).some(Boolean);
}

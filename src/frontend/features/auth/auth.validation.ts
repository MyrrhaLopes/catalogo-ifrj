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

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Informe a senha";
  const unmet = getUnmetPasswordRules(password);
  if (unmet.length === 0) return undefined;
  if (unmet.length === 1) return unmet[0].message;
  return `A senha não atende aos requisitos: ${unmet.map((r) => lowerFirst(r.label)).join(", ")}`;
}

export function validateLoginForm(values: FormValues<LoginField>): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  // No login só exigimos a senha preenchida: contas antigas/admin podem não seguir as regras atuais.
  if (!values.password) errors.password = "Informe a senha";
  return errors;
}

export function validateRegisterForm(
  values: FormValues<RegisterField>,
): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const password = validateNewPassword(values.password);
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

import { ApiError } from "@/frontend/shared/api/client";
import type { FieldErrors } from "./auth.validation";

export type ServerFormError<F extends string> = {
  message?: string;
  fieldErrors: FieldErrors<F>;
};

type ResolveOptions<F extends string> = {
  /** Associa um status HTTP a um campo, exibindo a mensagem do servidor nele (ex: 409 → email). */
  fieldByStatus?: Partial<Record<number, F>>;
  /** Mensagem padrão para status sem mensagem do servidor. */
  fallbackMessage?: string;
};

export const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
export const SERVER_ERROR_MESSAGE =
  "Ocorreu um erro no servidor. Tente novamente em alguns instantes.";
const DEFAULT_FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

function resolveApiError<F extends string>(
  error: ApiError,
  fields: readonly F[],
  options: ResolveOptions<F>,
): ServerFormError<F> {
  if (error.status >= 500) return { message: SERVER_ERROR_MESSAGE, fieldErrors: {} };

  const message = error.serverMessage ?? options.fallbackMessage ?? DEFAULT_FALLBACK;
  const statusField = options.fieldByStatus?.[error.status];
  if (statusField) return { fieldErrors: { [statusField]: message } as FieldErrors<F> };

  const fieldErrors: FieldErrors<F> = {};
  const unknownFieldMessages: string[] = [];
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    if (!messages?.length) continue;
    if ((fields as readonly string[]).includes(field)) fieldErrors[field as F] = messages[0];
    else unknownFieldMessages.push(messages[0]);
  }

  const generalMessages = [...error.formErrors, ...unknownFieldMessages];
  if (generalMessages.length > 0) return { message: generalMessages.join(". "), fieldErrors };
  // Erros já exibidos nos campos dispensam a mensagem genérica ("Dados inválidos").
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  return { message, fieldErrors };
}

/** Converte o erro de uma mutation em mensagens exibíveis no formulário. */
export function resolveServerError<F extends string>(
  error: unknown,
  fields: readonly F[],
  options: ResolveOptions<F> = {},
): ServerFormError<F> {
  if (error == null) return { fieldErrors: {} };
  if (error instanceof ApiError) return resolveApiError(error, fields, options);
  // fetch rejeita com TypeError quando não há resposta (offline, servidor fora do ar).
  if (error instanceof TypeError) return { message: NETWORK_ERROR_MESSAGE, fieldErrors: {} };
  if (error instanceof Error && error.message) return { message: error.message, fieldErrors: {} };
  return { message: options.fallbackMessage ?? DEFAULT_FALLBACK, fieldErrors: {} };
}

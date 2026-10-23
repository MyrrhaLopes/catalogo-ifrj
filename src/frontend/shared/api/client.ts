export type ApiFieldErrors = Record<string, string[] | undefined>;

type ApiErrorBody = {
  message?: unknown;
  errors?: { formErrors?: unknown; fieldErrors?: unknown };
};

export class ApiError extends Error {
  status: number;
  response: Response;
  /** Mensagem enviada pelo servidor no corpo da resposta, se houver. */
  serverMessage?: string;
  /** Erros de validação por campo (formato `z.flattenError` do errorHandler). */
  fieldErrors: ApiFieldErrors;
  formErrors: string[];

  constructor(status: number, response: Response, body?: unknown) {
    const parsed = parseErrorBody(body);
    // Mensagens de 5xx são internas do servidor; não as exponha como mensagem do erro.
    super((status < 500 && parsed.message) || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
    this.serverMessage = parsed.message;
    this.fieldErrors = parsed.fieldErrors;
    this.formErrors = parsed.formErrors;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function parseErrorBody(body: unknown): {
  message?: string;
  fieldErrors: ApiFieldErrors;
  formErrors: string[];
} {
  if (typeof body !== "object" || body === null) {
    return { fieldErrors: {}, formErrors: [] };
  }
  const { message, errors } = body as ApiErrorBody;
  const fieldErrors: ApiFieldErrors = {};
  if (typeof errors?.fieldErrors === "object" && errors.fieldErrors !== null) {
    for (const [field, msgs] of Object.entries(errors.fieldErrors)) {
      if (isStringArray(msgs) && msgs.length > 0) fieldErrors[field] = msgs;
    }
  }
  return {
    message: typeof message === "string" && message ? message : undefined,
    fieldErrors,
    formErrors: isStringArray(errors?.formErrors) ? errors.formErrors : [],
  };
}

async function readJsonBody(res: Response): Promise<unknown> {
  try {
    // clone() mantém o corpo original legível para quem tratar o ApiError.
    return await res.clone().json();
  } catch {
    return undefined;
  }
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  // FormData define o próprio Content-Type (multipart com boundary).
  const isJsonBody = options?.body != null && !(options.body instanceof FormData);
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new ApiError(res.status, res, await readJsonBody(res));
  return res;
}

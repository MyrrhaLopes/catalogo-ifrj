export class ApiError extends Error {
  status: number;
  response: Response;

  constructor(status: number, response: Response, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options?.body != null ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new ApiError(res.status, res);
  return res;
}

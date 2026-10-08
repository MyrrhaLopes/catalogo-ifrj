export class ApiError extends Error {
  constructor(public status: number, public response: Response, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
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

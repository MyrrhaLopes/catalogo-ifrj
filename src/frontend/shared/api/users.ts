import type {
  UserLoginInput,
  UserRegisterInput,
  UpdateUserInput,
} from "@/backend/http/features/users/user.schema";
import { apiFetch } from "@/frontend/shared/api/client";

// Erros são propagados como ApiError (com mensagem e erros por campo do servidor)
// e interpretados em features/auth/auth.errors.ts.
export async function registerUser(data: UserRegisterInput): Promise<void> {
  await apiFetch("/api/v1/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: UserLoginInput): Promise<void> {
  await apiFetch("/api/v1/sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/api/v1/sessions/", { method: "DELETE" });
}

export async function deleteAccount(): Promise<void> {
  await apiFetch("/api/v1/users/", { method: "DELETE" });
}

export async function updateUser(data: UpdateUserInput): Promise<void> {
  await apiFetch("/api/v1/users/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

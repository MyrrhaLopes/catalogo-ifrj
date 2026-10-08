import type {
  UserLoginInput,
  UserRegisterInput,
  UpdateUserInput,
} from "@/backend/http/features/users/user.schema";
import { apiFetch, ApiError } from "@/frontend/shared/api/client";

export async function registerUser(data: UserRegisterInput): Promise<void> {
  try {
    await apiFetch("/api/v1/users/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) throw new Error("Email já cadastrado");
    throw e;
  }
}

export async function loginUser(data: UserLoginInput): Promise<void> {
  try {
    await apiFetch("/api/v1/sessions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) throw new Error("Credenciais inválidas");
    throw e;
  }
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

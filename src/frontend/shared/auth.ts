import { redirect } from "@tanstack/react-router";
import type { UserInsert } from "@/backend/db/schema";

export async function requireAdmin(): Promise<UserInsert> {
  const res = await fetch("/api/v1/sessions/", { credentials: "include" });
  if (res.status === 401) throw redirect({ to: "/login" });
  const user = (await res.json()) as UserInsert;
  if (!user.isAdmin) throw redirect({ to: "/" });
  return user;
}

export async function requireAuth(): Promise<UserInsert> {
  const res = await fetch("/api/v1/sessions/", { credentials: "include" });
  if (res.status === 401) throw redirect({ to: "/login" });
  return (await res.json()) as UserInsert;
}

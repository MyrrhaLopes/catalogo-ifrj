import type { UserInsert } from "@/backend/db/schema";
import { useQuery } from "@tanstack/react-query";

export default function useAuth() {
  return useQuery({
    queryKey: ["auth", "current_user"],
    queryFn: async () => {
      const res = await fetch("/api/v1/sessions/", { credentials: "include" });
      if (res.status === 401) return null; // sem sessão válida = null, não é erro
      if (!res.ok) throw new Error("Erro ao verificar sessão");
      return res.json() as Promise<UserInsert>;
    },
  });
}

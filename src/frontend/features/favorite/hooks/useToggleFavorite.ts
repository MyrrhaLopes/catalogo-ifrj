import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  toggleFavoriteApi,
  getLocalFavorites,
  setLocalFavorites,
} from "../favorite.api";
import type { UserInsert } from "@/backend/db/schema";

export function useToggleFavorite(user: UserInsert | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (speciesId: number) => {
      if (user) {
        return toggleFavoriteApi(speciesId);
      }
      const current = getLocalFavorites();
      const isCurrentlyFavorited = current.includes(speciesId);
      const next = isCurrentlyFavorited
        ? current.filter((id) => id !== speciesId)
        : [...current, speciesId];
      setLocalFavorites(next);
      return {
        action: (isCurrentlyFavorited ? "removed" : "added") as "added" | "removed",
        speciesId,
      };
    },
    onSuccess: ({ action }) => {
      if (user) {
        void queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
        if (action === "added") toast.success("Adicionado aos favoritos!");
      } else {
        void queryClient.invalidateQueries({ queryKey: ["favorites", "local"] });
        if (action === "added")
          toast.warning("Salvo localmente. Crie uma conta para sincronizar entre dispositivos.");
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar favorito. Tente novamente.");
    },
  });
}

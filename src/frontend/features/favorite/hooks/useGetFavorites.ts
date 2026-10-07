import { useQuery } from "@tanstack/react-query";
import { getFavoriteIds, getLocalFavorites } from "../favorite.api";
import type { UserInsert } from "@/backend/db/schema";

export function useGetFavorites(user: UserInsert | null | undefined) {
  return useQuery({
    queryKey: ["favorites", user?.id ?? "local"],
    queryFn: () => {
      if (user) return getFavoriteIds();
      return Promise.resolve(getLocalFavorites());
    },
    staleTime: 1000 * 60,
  });
}

import { Star } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetFavorites } from "@/frontend/features/favorite/hooks/useGetFavorites";
import { useToggleFavorite } from "@/frontend/features/favorite/hooks/useToggleFavorite";
import useAuth from "@/frontend/shared/hooks/useAuth";

export function StarButton({ speciesId }: { speciesId: number }) {
  const { data: user } = useAuth();
  const { data: favoriteIds = [] } = useGetFavorites(user);
  const toggleMutation = useToggleFavorite(user);
  const isFavorited = favoriteIds.includes(speciesId);
  return (
    <Button
      size="icon"
      variant={isFavorited ? "default" : "outline"}
      onClick={() => toggleMutation.mutate(speciesId)}
      disabled={toggleMutation.isPending}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "rounded-full h-9 w-9",
        isFavorited
          ? "bg-yellow-400 hover:bg-yellow-500 border-yellow-400 text-white"
          : "bg-white/80 border-neutral-300 hover:bg-white text-neutral-600",
      )}
    >
      <Star className={cn("h-4 w-4", isFavorited && "fill-current")} />
    </Button>
  );
}

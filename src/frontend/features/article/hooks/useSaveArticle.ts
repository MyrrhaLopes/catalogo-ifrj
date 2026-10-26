import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import { createArticle, updateArticle } from "../article.api";

type SaveArticlePayload = {
  content: ArticleContent;
  deletedImageUrls?: string[];
};

export function useSaveArticle(speciesId: number, articleId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveArticlePayload) =>
      articleId !== null
        ? updateArticle(articleId, payload.content, payload.deletedImageUrls)
        : createArticle(speciesId, payload.content, payload.deletedImageUrls),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["species", "details", speciesId] });
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
      void queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (err) => {
      window.alert(err instanceof Error ? err.message : "Erro ao salvar artigo");
    },
  });
}

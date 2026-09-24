import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import { createArticle, updateArticle } from "../article.api";

export function useSaveArticle(speciesId: number, articleId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: ArticleContent) =>
      articleId !== null
        ? updateArticle(articleId, content)
        : createArticle(speciesId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["species", "details", speciesId] });
    },
    onError: (err) => {
      window.alert(err instanceof Error ? err.message : "Erro ao salvar artigo");
    },
  });
}

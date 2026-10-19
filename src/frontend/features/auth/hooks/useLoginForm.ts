import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import useLoginUser from "@/frontend/shared/hooks/useLoginUser";
import useAuth from "@/frontend/shared/hooks/useAuth";
import {
  getLocalFavorites,
  setLocalFavorites,
  syncFavoritesApi,
} from "@/frontend/features/favorite/favorite.api";
import { LOGIN_FIELDS, validateLoginForm } from "../auth.validation";
import { resolveServerError } from "../auth.errors";
import { useValidatedForm } from "./useValidatedForm";

export function useLoginForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const mutation = useLoginUser();

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const form = useValidatedForm({ email: "", password: "" }, validateLoginForm, {
    onChange: () => {
      if (mutation.isError) mutation.reset();
    },
  });

  const serverError = resolveServerError(mutation.error, LOGIN_FIELDS, {
    fallbackMessage: "Não foi possível entrar. Tente novamente.",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: async () => {
          const localFavorites = getLocalFavorites();
          if (localFavorites.length > 0) {
            await syncFavoritesApi(localFavorites).catch(() => null);
            setLocalFavorites([]);
          }
          queryClient.invalidateQueries({ queryKey: ["auth", "current_user"] });
        },
      },
    );
  });

  return {
    fieldProps: form.fieldProps,
    fieldErrors: { ...serverError.fieldErrors, ...form.errors },
    formError: serverError.message,
    isPending: mutation.isPending,
    onSubmit,
  };
}

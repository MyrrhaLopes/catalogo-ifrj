import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/frontend/shared/api/users";

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
  });
}

import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/frontend/api/users";

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
  });
}

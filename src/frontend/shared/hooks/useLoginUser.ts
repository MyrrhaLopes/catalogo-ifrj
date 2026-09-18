import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/users";

export default function useLoginUser() {
  return useMutation({ mutationFn: loginUser });
}

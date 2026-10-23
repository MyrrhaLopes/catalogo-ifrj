import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImage, type UploadImageInput } from "../images.api";

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadImageInput) => uploadImage(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["images"] });
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

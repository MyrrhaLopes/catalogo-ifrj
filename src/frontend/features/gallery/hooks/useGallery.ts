import { useQuery } from "@tanstack/react-query";
import { getGallery } from "../gallery.api";

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: getGallery,
    staleTime: 60_000,
  });
}

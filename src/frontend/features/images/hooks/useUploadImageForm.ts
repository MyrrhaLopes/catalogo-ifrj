import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/frontend/shared/api/client";
import { useSpecimenList } from "@/frontend/features/specimens/hooks/useAdminSpecimen";
import type { GalleryImage } from "../images.api";
import { validateImageFile } from "../utils/validateImageFile";
import { useUploadImage } from "./useUploadImage";

export type UploadImageType = "online" | "acervo";

export function useUploadImageForm(speciesId: number, onUploaded: (image: GalleryImage) => void) {
  const uploadMutation = useUploadImage();
  const { data: specimenData } = useSpecimenList();

  const [picked, setPicked] = useState<{ file: File; previewUrl: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [type, setType] = useState<UploadImageType>("online");
  const [alt, setAlt] = useState("");
  const [source, setSource] = useState("");
  const [credit, setCredit] = useState("");
  const [specimenId, setSpecimenId] = useState<number | "">("");

  // Libera a URL de preview anterior ao trocar de arquivo e ao desmontar.
  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.previewUrl); }, [picked]);

  const specimens = useMemo(
    () => (specimenData ?? []).filter((s) => s.linkedSpeciesId === speciesId),
    [specimenData, speciesId],
  );

  function selectFile(selected: File | null) {
    if (!selected) return;
    const validation = validateImageFile(selected);
    setFileError(validation.ok ? null : validation.error);
    setPicked(validation.ok ? { file: selected, previewUrl: URL.createObjectURL(selected) } : null);
  }

  function reset() {
    setPicked(null);
    setFileError(null);
    setType("online");
    setAlt("");
    setSource("");
    setCredit("");
    setSpecimenId("");
  }

  async function submit() {
    const file = picked?.file;
    if (!file) return;
    try {
      const image = await uploadMutation.mutateAsync({
        file,
        speciesId,
        type,
        alt: alt.trim() || undefined,
        source: type === "online" ? source.trim() || undefined : undefined,
        credit: type === "online" ? credit.trim() || undefined : undefined,
        specimenId: type === "acervo" && specimenId !== "" ? specimenId : undefined,
      });
      toast.success("Imagem enviada!");
      onUploaded(image);
      reset();
    } catch (err) {
      const message = err instanceof ApiError && err.status < 500 ? err.message : null;
      toast.error(message ?? "Erro ao enviar a imagem. Tente novamente.");
    }
  }

  return {
    file: picked?.file ?? null, previewUrl: picked?.previewUrl ?? null, fileError, selectFile,
    type, setType, alt, setAlt, source, setSource, credit, setCredit,
    specimenId, setSpecimenId, specimens,
    isPending: uploadMutation.isPending,
    submit, reset,
  };
}

export type UploadImageForm = ReturnType<typeof useUploadImageForm>;

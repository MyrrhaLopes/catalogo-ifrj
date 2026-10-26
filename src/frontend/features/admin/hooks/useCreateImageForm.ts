import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/frontend/shared/api/client";
import { validateImageFile } from "@/frontend/features/images/utils/validateImageFile";
import { useUploadImage } from "@/frontend/features/images/hooks/useUploadImage";
import { useCreateImage } from "./useAdminImages";
import { useSpeciesList } from "./useAdminSpecies";

export type CreateImageType = "online" | "acervo";

export function useCreateImageForm(defaultSpeciesId: number | undefined, onCreated: () => void) {
  const createMutation = useCreateImage();
  const uploadMutation = useUploadImage();
  const { data: speciesList = [] } = useSpeciesList();

  const [speciesId, setSpeciesId] = useState<number | "">(defaultSpeciesId ?? "");
  const [type, setType] = useState<CreateImageType>("online");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [credit, setCredit] = useState("");
  const [specimenId, setSpecimenId] = useState<number | "">("");
  const [picked, setPicked] = useState<{ file: File; previewUrl: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Libera a URL de preview anterior ao trocar de arquivo e ao desmontar.
  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.previewUrl); }, [picked]);

  const selectedSpecies = speciesId !== "" ? speciesList.find((s) => s.id === Number(speciesId)) : null;
  const specimens = selectedSpecies?.specimens ?? [];

  function selectSpecies(id: number | "") {
    setSpeciesId(id);
    setSpecimenId("");
  }

  function selectFile(selected: File | null) {
    if (!selected) return;
    const validation = validateImageFile(selected);
    setFileError(validation.ok ? null : validation.error);
    setPicked(validation.ok ? { file: selected, previewUrl: URL.createObjectURL(selected) } : null);
  }

  function reset() {
    setSpeciesId(defaultSpeciesId ?? "");
    setType("online");
    setAlt("");
    setUrl("");
    setSource("");
    setCredit("");
    setSpecimenId("");
    setPicked(null);
    setFileError(null);
  }

  const canSubmit = speciesId !== "" && (type === "online" ? url.trim().length > 0 : picked !== null);

  async function submit() {
    if (!canSubmit) return;
    try {
      if (type === "online") {
        await createMutation.mutateAsync({
          url: url.trim(),
          alt: alt.trim() || undefined,
          speciesId: Number(speciesId),
          type: "online",
          source: source.trim() || undefined,
          credit: credit.trim() || undefined,
        });
      } else {
        if (!picked) return;
        await uploadMutation.mutateAsync({
          file: picked.file,
          speciesId: Number(speciesId),
          type: "acervo",
          alt: alt.trim() || undefined,
          specimenId: specimenId !== "" ? specimenId : undefined,
        });
        toast.success("Imagem enviada!");
      }
      reset();
      onCreated();
    } catch (err) {
      // erro do createMutation (online) já é exibido via toast pelo onError do hook
      if (type !== "acervo") return;
      // 503 é um status deliberado e seguro de expor (bucket não configurado),
      // diferente de um 500 genérico que pode conter detalhes internos.
      const message =
        err instanceof ApiError
          ? err.status < 500
            ? err.message
            : err.status === 503
              ? err.serverMessage ?? null
              : null
          : null;
      toast.error(message ?? "Erro ao enviar a imagem. Tente novamente.");
    }
  }

  return {
    speciesList,
    speciesId,
    selectSpecies,
    specimens,
    type,
    setType,
    alt,
    setAlt,
    url,
    setUrl,
    source,
    setSource,
    credit,
    setCredit,
    specimenId,
    setSpecimenId,
    file: picked?.file ?? null,
    previewUrl: picked?.previewUrl ?? null,
    fileError,
    selectFile,
    isPending: createMutation.isPending || uploadMutation.isPending,
    canSubmit,
    submit,
    reset,
  };
}

export type CreateImageForm = ReturnType<typeof useCreateImageForm>;

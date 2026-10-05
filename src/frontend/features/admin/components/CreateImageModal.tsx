import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Loader2, Globe, Camera } from "lucide-react";
import { useCreateImage } from "../hooks/useAdminImages";
import { useSpeciesList } from "../hooks/useAdminSpecies";
import type { SpeciesSearchResult } from "@/backend/http/features/species/species.schema";

const SELECT_CLS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

function getScientificName(taxonomyPath: SpeciesSearchResult["taxonomyPath"]): string {
  const last = taxonomyPath.at(-1);
  const secondLast = taxonomyPath.at(-2);
  if (last?.label === "Espécie" && secondLast) return `${secondLast.labelValue} ${last.labelValue}`;
  return last?.labelValue ?? "Espécie";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSpeciesId?: number;
};

export function CreateImageModal({ open, onOpenChange, defaultSpeciesId }: Props) {
  const createMutation = useCreateImage();
  const { data: speciesList = [] } = useSpeciesList();

  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [speciesId, setSpeciesId] = useState<number | "">(defaultSpeciesId ?? "");
  const [type, setType] = useState<"online" | "acervo">("online");
  const [source, setSource] = useState("");
  const [credit, setCredit] = useState("");
  const [specimenId, setSpecimenId] = useState<number | "">("");

  const selectedSpecies =
    speciesId !== "" ? speciesList.find((s) => s.id === Number(speciesId)) : null;
  const availableSpecimens = selectedSpecies?.specimens ?? [];

  function handleClose() {
    setUrl("");
    setAlt("");
    setSpeciesId(defaultSpeciesId ?? "");
    setType("online");
    setSource("");
    setCredit("");
    setSpecimenId("");
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || speciesId === "") return;
    await createMutation.mutateAsync({
      url: url.trim(),
      alt: alt.trim() || undefined,
      speciesId: Number(speciesId),
      type,
      source: source.trim() || undefined,
      credit: credit.trim() || undefined,
      specimenId: specimenId !== "" ? Number(specimenId) : undefined,
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar imagem</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Espécie */}
          <div className="space-y-1.5">
            <Label htmlFor="img-species">Espécie *</Label>
            <select
              id="img-species"
              value={speciesId}
              onChange={(e) => {
                setSpeciesId(e.target.value === "" ? "" : Number(e.target.value));
                setSpecimenId("");
              }}
              required
              className={SELECT_CLS}
            >
              <option value="">Selecione uma espécie...</option>
              {speciesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {getScientificName(s.taxonomyPath)} (#{s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de imagem</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("online")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors ${
                  type === "online"
                    ? "border-green-700 bg-green-50 text-green-800"
                    : "border-input text-neutral-600 hover:border-neutral-400"
                }`}
              >
                <Globe className="h-4 w-4" />
                Referência online
              </button>
              <button
                type="button"
                onClick={() => setType("acervo")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors ${
                  type === "acervo"
                    ? "border-green-700 bg-green-50 text-green-800"
                    : "border-input text-neutral-600 hover:border-neutral-400"
                }`}
              >
                <Camera className="h-4 w-4" />
                Foto do acervo
              </button>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="img-url">
              URL da imagem {type === "online" ? "*" : "(opcional para acervo)"}
            </Label>
            <Input
              id="img-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required={type === "online"}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="img-alt">Descrição</Label>
            <Input
              id="img-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Descrição da imagem..."
            />
          </div>

          {/* Online fields */}
          {type === "online" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="img-source">URL da fonte</Label>
                <Input
                  id="img-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="https://commons.wikimedia.org/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="img-credit">Crédito (autor / licença)</Label>
                <Input
                  id="img-credit"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="Autor · CC BY-SA 4.0"
                />
              </div>
            </>
          )}

          {/* Acervo fields */}
          {type === "acervo" && (
            <div className="space-y-1.5">
              <Label htmlFor="img-specimen">Espécime</Label>
              <select
                id="img-specimen"
                value={specimenId}
                onChange={(e) =>
                  setSpecimenId(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={SELECT_CLS}
                disabled={availableSpecimens.length === 0}
              >
                <option value="">
                  {availableSpecimens.length === 0
                    ? speciesId === ""
                      ? "Selecione uma espécie primeiro"
                      : "Nenhum espécime vinculado a esta espécie"
                    : "Selecionar espécime..."}
                </option>
                {availableSpecimens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                    {s.shelf != null ? ` · Prat. ${s.shelf}` : ""}
                    {s.lot != null ? ` · Lote ${s.lot}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                (type === "online" && !url.trim()) ||
                speciesId === ""
              }
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Loader2 } from "lucide-react";
import { ImageOriginToggle } from "@/frontend/features/images/components/ImageOriginToggle";
import { ImageFileInput } from "@/frontend/features/images/components/ImageFileInput";
import { SpecimenPicker } from "@/frontend/features/images/components/SpecimenPicker";
import { useCreateImageForm } from "../hooks/useCreateImageForm";
import { getScientificName } from "@/frontend/shared/utils/taxonomy";

const SELECT_CLS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSpeciesId?: number;
};

export function CreateImageModal({ open, onOpenChange, defaultSpeciesId }: Props) {
  const form = useCreateImageForm(defaultSpeciesId, () => onOpenChange(false));

  function handleClose() {
    if (form.isPending) return;
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar imagem</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.submit();
          }}
          className="space-y-4 py-2"
        >
          {/* Espécie */}
          <div className="space-y-1.5">
            <Label htmlFor="img-species">Espécie *</Label>
            <select
              id="img-species"
              value={form.speciesId}
              onChange={(e) => form.selectSpecies(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className={SELECT_CLS}
            >
              <option value="">Selecione uma espécie...</option>
              {form.speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {getScientificName(species.taxonomyPath)} (#{species.id})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de imagem</Label>
            <ImageOriginToggle value={form.type} onChange={form.setType} />
          </div>

          {/* Origem da imagem: URL para referência online, upload para foto do acervo */}
          {form.type === "online" ? (
            <div className="space-y-1.5">
              <Label htmlFor="img-url">URL da imagem *</Label>
              <Input
                id="img-url"
                value={form.url}
                onChange={(e) => form.setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
          ) : (
            <ImageFileInput
              previewUrl={form.previewUrl}
              error={form.fileError}
              disabled={form.isPending}
              onSelect={form.selectFile}
            />
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="img-alt">Descrição</Label>
            <Input
              id="img-alt"
              value={form.alt}
              onChange={(e) => form.setAlt(e.target.value)}
              placeholder="Descrição da imagem..."
            />
          </div>

          {/* Online fields */}
          {form.type === "online" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="img-source">URL da fonte</Label>
                <Input
                  id="img-source"
                  value={form.source}
                  onChange={(e) => form.setSource(e.target.value)}
                  placeholder="https://commons.wikimedia.org/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="img-credit">Crédito (autor / licença)</Label>
                <Input
                  id="img-credit"
                  value={form.credit}
                  onChange={(e) => form.setCredit(e.target.value)}
                  placeholder="Autor · CC BY-SA 4.0"
                />
              </div>
            </>
          )}

          {/* Acervo fields */}
          {form.type === "acervo" && (
            <div className="space-y-1.5">
              <Label>Espécime</Label>
              <SpecimenPicker
                specimens={form.specimens}
                value={form.specimenId}
                onChange={form.setSpecimenId}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={form.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.isPending || !form.canSubmit}>
              {form.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

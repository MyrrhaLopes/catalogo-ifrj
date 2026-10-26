import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import type { UploadImageForm } from "../hooks/useUploadImageForm";
import { SpecimenPicker } from "./SpecimenPicker";

export function UploadImageDetailsFields({ form }: { form: UploadImageForm }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="upload-alt">Descrição</Label>
        <Input
          id="upload-alt"
          value={form.alt}
          onChange={(e) => form.setAlt(e.target.value)}
          placeholder="Descrição da imagem..."
        />
      </div>

      {form.type === "online" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="upload-source">URL da fonte</Label>
            <Input
              id="upload-source"
              value={form.source}
              onChange={(e) => form.setSource(e.target.value)}
              placeholder="https://commons.wikimedia.org/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upload-credit">Crédito (autor / licença)</Label>
            <Input
              id="upload-credit"
              value={form.credit}
              onChange={(e) => form.setCredit(e.target.value)}
              placeholder="Autor · CC BY-SA 4.0"
            />
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <Label>Espécime</Label>
          <SpecimenPicker
            specimens={form.specimens}
            value={form.specimenId}
            onChange={form.setSpecimenId}
          />
        </div>
      )}
    </>
  );
}

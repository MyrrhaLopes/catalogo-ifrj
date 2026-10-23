import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import type { UploadImageForm } from "../hooks/useUploadImageForm";

const SELECT_CLS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

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
          <Label htmlFor="upload-specimen">Espécime</Label>
          <select
            id="upload-specimen"
            value={form.specimenId}
            onChange={(e) => form.setSpecimenId(e.target.value === "" ? "" : Number(e.target.value))}
            className={SELECT_CLS}
            disabled={form.specimens.length === 0}
          >
            <option value="">
              {form.specimens.length === 0
                ? "Nenhum espécime vinculado a esta espécie"
                : "Selecionar espécime (opcional)..."}
            </option>
            {form.specimens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} ({s.exposicao === "seca" ? "seca" : "húmida"})
                {s.shelf != null ? ` · Prat. ${s.shelf}` : ""}
                {s.lot != null ? ` · Lote ${s.lot}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

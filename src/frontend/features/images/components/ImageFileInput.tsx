import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

type Props = {
  previewUrl: string | null;
  error: string | null;
  disabled?: boolean;
  onSelect: (file: File | null) => void;
};

// Sem o atributo `capture`: no celular o sistema abre o seletor nativo
// (câmera ou galeria); no computador, o explorador de arquivos.
export function ImageFileInput({ previewUrl, error, disabled, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onSelect(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {previewUrl ? (
        <button
          type="button"
          className="block w-full overflow-hidden rounded-md border border-input"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          title="Trocar imagem"
        >
          <img src={previewUrl} alt="Pré-visualização" className="max-h-64 w-full object-contain bg-muted" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-28 w-full flex-col gap-2 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">Tirar foto ou escolher imagem</span>
        </Button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

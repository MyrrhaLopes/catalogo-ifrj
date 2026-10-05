import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { useImagesList } from "@/frontend/features/admin/hooks/useAdminImages";
import type { GalleryImage } from "../images.api";
import { ImageIcon } from "lucide-react";

type Props = {
  speciesId: number;
  open: boolean;
  onClose: () => void;
  onSelect: (image: GalleryImage) => void;
};

export function ImagePickerModal({ speciesId, open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const { data: images = [], isLoading } = useImagesList(speciesId);

  const filtered = images.filter((img) =>
    !search || img.alt?.toLowerCase().includes(search.toLowerCase()) || img.url.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(image: GalleryImage) {
    onSelect(image);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar imagem da galeria</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Filtrar por descrição ou URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        {isLoading && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Carregando...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="text-sm">
              {images.length === 0
                ? "Nenhuma imagem na galeria desta espécie."
                : "Nenhuma imagem corresponde ao filtro."}
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {filtered.map((image) => (
              <button
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded border border-input hover:border-primary hover:ring-1 hover:ring-primary transition-all"
                onClick={() => handleSelect(image)}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? ""}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                {image.alt && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{image.alt}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

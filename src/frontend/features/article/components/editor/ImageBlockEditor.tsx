import { useState } from "react";
import type { ImageBlock } from "../types";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Button } from "@/frontend/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";
import { ImagePickerModal } from "@/frontend/features/images/components/ImagePickerModal";
import { UploadImageModal } from "@/frontend/features/images/components/UploadImageModal";
import type { GalleryImage } from "@/frontend/features/images/images.api";

type Props = {
  block: ImageBlock;
  speciesId: number;
  onChange: (block: ImageBlock) => void;
};

export function ImageBlockEditor({ block, speciesId, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  function handleSelect(image: GalleryImage) {
    onChange({ type: "image", content: image.url });
  }

  return (
    <div className="space-y-2 rounded border border-input bg-muted/30 p-3">
      <div>
        <Label className="text-xs">URL da imagem</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Input
            value={block.content}
            onChange={(e) => onChange({ type: "image", content: e.target.value })}
            placeholder="https://..."
            className="h-7 text-xs basis-full"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs shrink-0"
            onClick={() => setPickerOpen(true)}
            title="Selecionar da galeria"
          >
            <ImageIcon className="h-3 w-3 mr-1" />
            Galeria
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs shrink-0"
            onClick={() => setUploadOpen(true)}
            title="Enviar do dispositivo (câmera ou arquivo)"
          >
            <Upload className="h-3 w-3 mr-1" />
            Enviar
          </Button>
        </div>
      </div>
      {block.content && (
        <img src={block.content} alt="preview" className="max-h-32 rounded object-cover" />
      )}

      <ImagePickerModal
        speciesId={speciesId}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
      <UploadImageModal
        speciesId={speciesId}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleSelect}
      />
    </div>
  );
}

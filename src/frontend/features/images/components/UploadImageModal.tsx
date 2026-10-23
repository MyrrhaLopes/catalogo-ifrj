import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Label } from "@/frontend/components/ui/label";
import type { GalleryImage } from "../images.api";
import { useUploadImageForm } from "../hooks/useUploadImageForm";
import { ImageFileInput } from "./ImageFileInput";
import { ImageOriginToggle } from "./ImageOriginToggle";
import { UploadImageDetailsFields } from "./UploadImageDetailsFields";

type Props = {
  speciesId: number;
  open: boolean;
  onClose: () => void;
  onUploaded: (image: GalleryImage) => void;
};

export function UploadImageModal({ speciesId, open, onClose, onUploaded }: Props) {
  const form = useUploadImageForm(speciesId, (image) => {
    onUploaded(image);
    onClose();
  });

  function handleClose() {
    if (form.isPending) return;
    form.reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar imagem do dispositivo</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            void form.submit();
          }}
        >
          <ImageFileInput
            previewUrl={form.previewUrl}
            error={form.fileError}
            disabled={form.isPending}
            onSelect={form.selectFile}
          />

          <div className="space-y-1.5">
            <Label>Origem da imagem</Label>
            <ImageOriginToggle value={form.type} onChange={form.setType} />
          </div>

          <UploadImageDetailsFields form={form} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={form.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.file || form.isPending}>
              {form.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

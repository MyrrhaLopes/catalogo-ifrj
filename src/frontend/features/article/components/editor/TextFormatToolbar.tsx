import { Button } from "@/frontend/components/ui/button";
import { Bold, Italic } from "lucide-react";
import { CiteSourcePopover } from "./CiteSourcePopover";

type Props = {
  onBold: () => void;
  onItalic: () => void;
  citeOpen: boolean;
  onCiteOpenChange: (open: boolean) => void;
  citeUrl: string;
  onCiteUrlChange: (url: string) => void;
  onCiteSubmit: () => void;
  isCiting: boolean;
};

export function TextFormatToolbar({
  onBold,
  onItalic,
  citeOpen,
  onCiteOpenChange,
  citeUrl,
  onCiteUrlChange,
  onCiteSubmit,
  isCiting,
}: Props) {
  return (
    <div className="absolute top-1 right-1 z-10 flex items-center gap-1">
      {/*
       * onMouseDown + preventDefault keeps the textarea focused (and its
       * selection intact) when the user clicks these buttons.
       */}
      <Button
        size="sm"
        variant="outline"
        className="h-6 w-6 p-0"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onBold}
        aria-label="Negrito"
      >
        <Bold className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-6 w-6 p-0"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onItalic}
        aria-label="Itálico"
      >
        <Italic className="h-3 w-3" />
      </Button>
      <CiteSourcePopover
        open={citeOpen}
        onOpenChange={onCiteOpenChange}
        url={citeUrl}
        onUrlChange={onCiteUrlChange}
        onSubmit={onCiteSubmit}
        isSubmitting={isCiting}
      />
    </div>
  );
}

import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/frontend/components/ui/popover";
import { Quote } from "lucide-react";
import { domainFromUrl } from "../utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function CiteSourcePopover({ open, onOpenChange, url, onUrlChange, onSubmit, isSubmitting }: Props) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {/*
         * onMouseDown + preventDefault keeps the textarea focused (and its
         * selection intact) when the user clicks this button.
         */}
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs gap-1"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onOpenChange(true)}
        >
          <Quote className="h-3 w-3" />
          Citar fonte
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
        <p className="text-xs text-muted-foreground mb-2">URL da fonte</p>
        <div className="flex gap-2">
          <Input
            className="h-7 text-sm"
            placeholder="https://..."
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
              if (e.key === "Escape") onOpenChange(false);
            }}
            autoFocus
          />
          <Button
            size="sm"
            className="h-7 px-3 text-xs shrink-0"
            onClick={onSubmit}
            disabled={!url.trim() || isSubmitting}
          >
            Citar
          </Button>
        </div>
        {url.trim() && (
          <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{domainFromUrl(url.trim())}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

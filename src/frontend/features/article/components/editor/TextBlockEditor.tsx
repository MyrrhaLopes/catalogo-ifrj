import { useRef, useEffect, useState, useCallback } from "react";
import type { TextBlock } from "../types";
import { domainFromUrl } from "../utils";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/frontend/components/ui/popover";
import { Quote } from "lucide-react";

type Props = {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
};

export function TextBlockEditor({ block, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Saved cursor position where the citation marker will be inserted.
  // Stored in a ref so it survives the textarea losing focus when user
  // clicks the citation button or types in the URL input.
  const insertionPointRef = useRef<number | null>(null);

  const [showCiteButton, setShowCiteButton] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [citationUrl, setCitationUrl] = useState("");
  const [isCiting, setIsCiting] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.content]);

  const checkSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (el.selectionStart !== el.selectionEnd) {
      // Save the END of the selection as the insertion point for the citation marker.
      insertionPointRef.current = el.selectionEnd;
      setShowCiteButton(true);
    }
  }, []);

  // When popover closes without inserting, re-check whether the textarea
  // still has a selection so the button visibility stays correct.
  function handlePopoverOpenChange(open: boolean) {
    setPopoverOpen(open);
    if (!open) {
      setCitationUrl("");
      const el = textareaRef.current;
      const stillSelected =
        el != null && document.activeElement === el && el.selectionStart !== el.selectionEnd;
      if (!stillSelected) {
        setShowCiteButton(false);
        insertionPointRef.current = null;
      }
    }
  }

  async function handleCite() {
    const pos = insertionPointRef.current;
    if (pos === null || !citationUrl.trim()) return;

    const url = citationUrl.trim();
    setIsCiting(true);
    try {
      const res = await fetch("/api/v1/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Falha ao salvar fonte");
      const { source } = await res.json() as { source: { id: number } };
      const { id } = source;
      const marker = `[cite:${id}]`;
      const newContent = block.content.slice(0, pos) + marker + block.content.slice(pos);
      onChange({ type: "text", content: newContent });
      setCitationUrl("");
      setPopoverOpen(false);
      setShowCiteButton(false);
      insertionPointRef.current = null;
    } finally {
      setIsCiting(false);
    }
  }

  // Clicking inside the textarea without creating a selection should
  // dismiss the button (unless the popover is open).
  function handleTextareaClick() {
    if (popoverOpen) return;
    const el = textareaRef.current;
    if (el && el.selectionStart === el.selectionEnd) {
      setShowCiteButton(false);
      insertionPointRef.current = null;
    }
  }

  return (
    <div className="relative">
      {(showCiteButton || popoverOpen) && (
        <div className="absolute top-1 right-1 z-10">
          <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
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
                onClick={() => setPopoverOpen(true)}
              >
                <Quote className="h-3 w-3" />
                Citar fonte
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-72 p-3"
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <p className="text-xs text-muted-foreground mb-2">URL da fonte</p>
              <div className="flex gap-2">
                <Input
                  className="h-7 text-sm"
                  placeholder="https://..."
                  value={citationUrl}
                  onChange={(e) => setCitationUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCite();
                    if (e.key === "Escape") handlePopoverOpenChange(false);
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs shrink-0"
                  onClick={() => void handleCite()}
                  disabled={!citationUrl.trim() || isCiting}
                >
                  Citar
                </Button>
              </div>
              {citationUrl.trim() && (
                <p className="text-[10px] text-muted-foreground mt-1.5 truncate">
                  {domainFromUrl(citationUrl.trim())}
                </p>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange({ type: "text", content: e.target.value })}
        onMouseUp={checkSelection}
        onKeyUp={checkSelection}
        onClick={handleTextareaClick}
        placeholder="Texto (suporta markdown: # Título, ## Subtítulo, parágrafos…)"
        className="w-full resize-none overflow-hidden rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono min-h-[80px]"
        rows={3}
      />
    </div>
  );
}

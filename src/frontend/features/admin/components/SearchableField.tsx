import { useState, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string) => void;
  options: string[];
  placeholder?: string;
  autoFocus?: boolean;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function scoreSimilarity(option: string, query: string): number {
  const o = option.toLowerCase();
  const q = query.toLowerCase();
  if (o === q) return 3;
  if (o.startsWith(q)) return 2;
  return 1;
}

type DropdownPos = { top: number; left: number; width: number };

export function SearchableField({ id, value, onChange, onSelect, options, placeholder, autoFocus, inputClassName, onKeyDown }: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Portal target: document.body, unless we're inside a Radix Dialog — then we
  // portal into DialogContent itself, since body gets pointer-events:none while
  // a modal Dialog is open (clicks outside Content would be swallowed/dismiss it).
  const portalContainerRef = useRef<Element>(document.body);
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  const q = value.trim();

  const filtered = q
    ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : options;

  const sorted = q
    ? [...filtered].sort((a, b) => scoreSimilarity(b, q) - scoreSimilarity(a, q)).slice(0, 3)
    : filtered.slice(0, 3);

  const showDropdown = open && sorted.length > 0;

  function updatePos() {
    if (!inputRef.current) return;
    const container =
      (inputRef.current.closest('[role="dialog"]') as HTMLElement | null) ?? document.body;
    portalContainerRef.current = container;

    const rect = inputRef.current.getBoundingClientRect();
    if (container === document.body) {
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    } else {
      // DialogContent's CSS transform makes it the containing block for
      // fixed-position descendants — position relative to it, not the viewport.
      const containerRect = container.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom - containerRect.top + 4,
        left: rect.left - containerRect.left,
        width: rect.width,
      });
    }
  }

  // Re-measure after the Dialog's open animation (zoom-in/slide) settles.
  function scheduleReposition() {
    updatePos();
    requestAnimationFrame(() => requestAnimationFrame(updatePos));
    setTimeout(updatePos, 220);
  }

  function select(val: string) {
    onChange(val);
    setOpen(false);
    if (onSelect) {
      onSelect(val);
    } else {
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={placeholder}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
          "outline-none transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName,
        )}
        onChange={(e) => {
          onChange(e.target.value);
          updatePos();
          setOpen(true);
        }}
        onFocus={() => { scheduleReposition(); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          onKeyDown?.(e);
        }}
      />

      {showDropdown && dropdownPos && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
          }}
          className="flex flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {sorted.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                opt.toLowerCase() === q.toLowerCase() && "bg-muted font-medium",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                select(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>,
        portalContainerRef.current,
      )}
    </div>
  );
}

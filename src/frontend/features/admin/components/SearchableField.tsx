import { useState, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { cn } from "@/frontend/shared/utils";

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
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  const q = value.trim();

  const filtered = q
    ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : options;

  const sorted = q
    ? [...filtered].sort((a, b) => scoreSimilarity(b, q) - scoreSimilarity(a, q)).slice(0, 3)
    : filtered.slice(0, 3);

  const showCreate = q.length > 0 && filtered.length === 0;
  const showDropdown = open && (sorted.length > 0 || showCreate);

  function updatePos() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
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
        onFocus={() => { updatePos(); setOpen(true); }}
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

          {showCreate && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-muted transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                select(q);
              }}
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Criar &ldquo;{q}&rdquo;
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttributeTemplateKind } from "../admin.api";

type Props = {
  kind: AttributeTemplateKind;
  onKindChange: (kind: AttributeTemplateKind) => void;
  options: string[];
  onOptionsChange: (options: string[]) => void;
};

const KIND_OPTIONS: Array<{ value: AttributeTemplateKind; label: string }> = [
  { value: "numeric", label: "Numérico" },
  { value: "categorical", label: "Categórico" },
];

/** Tipo (numérico/categórico) + editor de opções fechadas, usado ao criar/editar um template de atributo. */
export function AttributeKindFields({ kind, onKindChange, options, onOptionsChange }: Props) {
  const [draft, setDraft] = useState("");

  function addOption() {
    const trimmed = draft.trim();
    if (!trimmed || options.includes(trimmed)) return;
    onOptionsChange([...options, trimmed]);
    setDraft("");
  }

  function removeOption(option: string) {
    onOptionsChange(options.filter((o) => o !== option));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tipo</span>
        <div className="flex gap-2">
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onKindChange(opt.value)}
              className={cn(
                "rounded-md border px-3 py-1 text-sm transition-colors",
                kind === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:bg-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {kind === "categorical" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Opções possíveis <span className="text-muted-foreground font-normal">(pelo menos uma)</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {options.map((option) => (
              <span
                key={option}
                className="flex items-center gap-1 rounded-full border border-input bg-muted px-2.5 py-0.5 text-xs"
              >
                {option}
                <button type="button" onClick={() => removeOption(option)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              placeholder="Ex: LC, VU, CR…"
              className="h-8"
            />
            <Button type="button" size="sm" variant="outline" onClick={addOption} disabled={!draft.trim()}>
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

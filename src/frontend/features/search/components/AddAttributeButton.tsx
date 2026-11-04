import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAttributeTemplates } from "@/frontend/features/species/hooks/useAttributeTemplates";
import { getDefaultDisplayUnit } from "../utils/unitConversion";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import { AttributeTemplateDropdown } from "./AttributeTemplateDropdown";
import type { ActiveAttrFilter } from "./AttributeFilters";

type Props = {
  activeFilters: ActiveAttrFilter[];
  onAdd: (filter: ActiveAttrFilter) => void;
};

function buildFilterForTemplate(template: AttributeTemplate): ActiveAttrFilter {
  if (template.kind === "categorical") {
    return { kind: "categorical", templateId: template.id, template, selectedValues: [] };
  }
  return {
    kind: "numeric",
    templateId: template.id,
    template,
    displayValue: "",
    displayValue2: "",
    displayUnit: getDefaultDisplayUnit(template.unit),
    operator: "=",
  };
}

/** Standalone "Adicionar atributo" dropdown — place this wherever needed in the parent layout. */
export function AddAttributeButton({ activeFilters, onAdd }: Props) {
  const { data: templates = [], isLoading } = useAttributeTemplates();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (isLoading) return null;

  const usedIds = new Set(activeFilters.map((f) => f.templateId));
  const available = templates.filter((t) => !usedIds.has(t.id));

  if (available.length === 0) return null;

  function handleAdd(template: AttributeTemplate) {
    onAdd(buildFilterForTemplate(template));
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-green-500 hover:text-green-700"
      >
        Adicionar atributo
        <ChevronDown size={12} />
      </button>
      {open && <AttributeTemplateDropdown templates={available} onSelect={handleAdd} />}
    </div>
  );
}

import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditAttributeKindModal } from "./EditAttributeKindModal";
import type { AttributeTemplateItem } from "../admin.api";

type Props = { template: AttributeTemplateItem };

/** Badge de tipo (numérico/categórico) com botão pra editar tipo + opções — célula de AttributeTemplatesTable. */
export function AttributeKindCell({ template }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          template.kind === "categorical" ? "bg-violet-100 text-violet-700" : "bg-muted text-muted-foreground",
        )}
      >
        {template.kind === "categorical" ? `Categórico (${template.options?.length ?? 0})` : "Numérico"}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {editing && <EditAttributeKindModal template={template} onOpenChange={setEditing} />}
    </div>
  );
}

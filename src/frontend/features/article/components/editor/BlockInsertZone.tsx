import { Plus, Type, Image as ImageIcon, Columns2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { genDraftId } from "../../hooks/useArticleEditor";
import type { DraftItem } from "../../hooks/useArticleEditor";

type BlockType = "text" | "image" | "column";

type Props = {
  onAdd: (item: DraftItem) => void;
  options?: BlockType[];
};

export function BlockInsertZone({ onAdd, options = ["text", "image", "column"] }: Props) {
  function handleAdd(type: BlockType) {
    const id = genDraftId();
    if (type === "text") {
      onAdd({ id, kind: "block", block: { type: "text", content: "" } });
    } else if (type === "image") {
      onAdd({ id, kind: "block", block: { type: "image", content: "" } });
    } else {
      onAdd({ id, kind: "block", block: { type: "column", columns: [[], []] } });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="group relative h-3 cursor-pointer flex items-center my-0.5">
          <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-green-500 transition-opacity rounded-full" />
          <Plus className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-white bg-green-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs min-w-32">
        {options.includes("text") && (
          <DropdownMenuItem className="text-xs gap-2" onClick={() => handleAdd("text")}>
            <Type className="h-3 w-3" /> Texto
          </DropdownMenuItem>
        )}
        {options.includes("image") && (
          <DropdownMenuItem className="text-xs gap-2" onClick={() => handleAdd("image")}>
            <ImageIcon className="h-3 w-3" /> Imagem
          </DropdownMenuItem>
        )}
        {options.includes("column") && (
          <DropdownMenuItem className="text-xs gap-2" onClick={() => handleAdd("column")}>
            <Columns2 className="h-3 w-3" /> Coluna
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

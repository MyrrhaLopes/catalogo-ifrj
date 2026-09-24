import type { ImageBlock } from "../types";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

type Props = {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
};

export function ImageBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-2 rounded border border-input bg-muted/30 p-3">
      <div>
        <Label className="text-xs">URL da imagem</Label>
        <Input
          value={block.content}
          onChange={(e) => onChange({ type: "image", content: e.target.value })}
          placeholder="https://..."
          className="h-7 text-xs mt-1"
        />
      </div>
      {block.content && (
        <img src={block.content} alt="preview" className="max-h-32 rounded object-cover" />
      )}
    </div>
  );
}

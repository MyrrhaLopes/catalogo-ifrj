import { useRef, useEffect } from "react";
import type { TextBlock } from "../types";

type Props = {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
};

export function TextBlockEditor({ block, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.content]);

  return (
    <textarea
      ref={ref}
      value={block.content}
      onChange={(e) => onChange({ type: "text", content: e.target.value })}
      placeholder="Texto (suporta markdown: # Título, ## Subtítulo, parágrafos…)"
      className="w-full resize-none overflow-hidden rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono min-h-[80px]"
      rows={3}
    />
  );
}

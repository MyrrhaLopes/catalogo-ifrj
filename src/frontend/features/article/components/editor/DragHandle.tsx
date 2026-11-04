import type { HTMLAttributes } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLSpanElement> & { size?: "sm" | "md" };

/** Alça de arraste; recebe `attributes`/`listeners` do `useSortable`. */
export function DragHandle({ size = "md", className, ...rest }: Props) {
  return (
    <span
      {...rest}
      className={cn(
        "cursor-grab text-muted-foreground hover:text-foreground p-0.5 mt-1 shrink-0 touch-none",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </span>
  );
}

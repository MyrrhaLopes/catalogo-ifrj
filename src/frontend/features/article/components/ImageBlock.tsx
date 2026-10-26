import { cn } from "@/lib/utils";

export function ImageBlock({
  content,
  alt,
  onImageClick,
}: {
  content: string;
  alt?: string;
  onImageClick?: (url: string) => void;
}) {
  return (
    <figure className="mb-6">
      <img
        src={content}
        alt={alt ?? ""}
        className={cn(
          "w-full rounded object-cover",
          onImageClick && "cursor-pointer hover:opacity-95 transition-opacity",
        )}
        onClick={() => onImageClick?.(content)}
      />
    </figure>
  );
}

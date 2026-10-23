import { Camera, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadImageType } from "../hooks/useUploadImageForm";

const OPTIONS = [
  { value: "online", label: "Referência online", Icon: Globe },
  { value: "acervo", label: "Foto do acervo", Icon: Camera },
] as const;

type Props = {
  value: UploadImageType;
  onChange: (value: UploadImageType) => void;
};

export function ImageOriginToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Origem da imagem">
      {OPTIONS.map(({ value: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors",
            value === option
              ? "border-green-700 bg-green-50 text-green-800"
              : "border-input text-neutral-600 hover:border-neutral-400",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

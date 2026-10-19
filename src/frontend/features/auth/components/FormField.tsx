import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: string;
  error?: string;
  /** Conteúdo auxiliar exibido abaixo do campo (ex: requisitos de senha). */
  hint?: ReactNode;
};

export function FormField({ id, label, error, hint, className, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
      {hint && <div id={hintId}>{hint}</div>}
    </div>
  );
}

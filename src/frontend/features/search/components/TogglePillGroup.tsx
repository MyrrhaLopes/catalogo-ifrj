import { cn } from "@/lib/utils";

type Option<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  title: string;
  options: readonly Option<T>[];
  isActive: (key: T) => boolean;
  onToggle: (key: T) => void;
};

/** Grupo de pills de toggle usado nos filtros de busca (ex: "Buscar em", "Exposição"). */
export function TogglePillGroup<T extends string>({ title, options, isActive, onToggle }: Props<T>) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      <div className="flex gap-2">
        {options.map(({ key, label }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors tv:text-sm",
                active
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

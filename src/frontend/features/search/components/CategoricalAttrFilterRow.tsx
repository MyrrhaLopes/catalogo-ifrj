import type { CategoricalActiveAttrFilter } from "./AttributeFilters";

type Props = {
  filter: CategoricalActiveAttrFilter;
  onChange: (selectedValues: string[]) => void;
};

/** Checkboxes com as opções fechadas de um atributo categórico — linha de AttributeFilters. */
export function CategoricalAttrFilterRow({ filter: f, onChange }: Props) {
  const options = f.template.options ?? [];

  function toggle(option: string) {
    const next = f.selectedValues.includes(option)
      ? f.selectedValues.filter((v) => v !== option)
      : [...f.selectedValues, option];
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const checked = f.selectedValues.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
              checked
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

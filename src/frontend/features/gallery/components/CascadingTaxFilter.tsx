import type { EnrichedImage } from "../gallery.api";

type Props = {
  allImages: EnrichedImage[];
  taxLabels: string[];
  taxPath: string[];
  onChange: (path: string[]) => void;
};

export function CascadingTaxFilter({ allImages, taxLabels, taxPath, onChange }: Props) {
  const lastSelectedIndex = taxPath.reduce((max, val, i) => (val ? i : max), -1);
  const visibleLabels = taxLabels.slice(0, lastSelectedIndex + 2);

  function getOptionsForLevel(levelIndex: number): string[] {
    let imgs = allImages;
    for (let i = 0; i < levelIndex; i++) {
      const label = taxLabels[i];
      const val = taxPath[i];
      if (label && val) {
        imgs = imgs.filter((img) => img.taxonomyPath.find((n) => n.label === label)?.labelValue === val);
      }
    }
    const label = taxLabels[levelIndex];
    const seen = new Set<string>();
    const opts: string[] = [];
    for (const img of imgs) {
      const val = img.taxonomyPath.find((n) => n.label === label)?.labelValue;
      if (val && !seen.has(val)) { seen.add(val); opts.push(val); }
    }
    return opts.sort();
  }

  function handleSelect(levelIndex: number, value: string) {
    const next = taxPath.slice(0, levelIndex);
    if (value) next.push(value);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {visibleLabels.map((label, index) => {
        const options = getOptionsForLevel(index);
        const selected = taxPath[index] ?? "";
        return (
          <div key={label} className={index > 0 ? "pl-2" : ""}>
            <p className="text-xs text-neutral-500 mb-1 tv:text-sm">{label}</p>
            <select
              value={selected}
              onChange={(e) => handleSelect(index, e.target.value)}
              className="w-full rounded-md border border-input bg-white px-2 py-1.5 text-xs text-neutral-700 outline-none focus:ring-1 focus:ring-ring tv:text-sm tv:py-2"
            >
              <option value="">Selecionar {label.toLowerCase()}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

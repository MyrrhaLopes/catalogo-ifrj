import type { EnrichedImage } from "../gallery.api";
import { filterByTaxonomyPath } from "../utils/filterTaxonomy";

type Props = {
  allImages: EnrichedImage[];
  taxLabels: string[];
  taxPath: string[];
  onChange: (path: string[]) => void;
};

function getNodeValue(img: EnrichedImage, label: string): string | undefined {
  const node = img.taxonomyPath.find((n) => n.label === label);
  return node ? node.labelValue : undefined;
}

function extractLevelOptions(imgs: EnrichedImage[], label: string | undefined): string[] {
  if (!label) return [];
  const values = imgs.map((img) => getNodeValue(img, label)).filter(Boolean) as string[];
  return Array.from(new Set(values)).sort();
}

export function CascadingTaxFilter({ allImages, taxLabels, taxPath, onChange }: Props) {
  const lastSelectedIndex = taxPath.reduce((max, val, i) => (val ? i : max), -1);
  const visibleLabels = taxLabels.slice(0, lastSelectedIndex + 2);

  function getOptionsForLevel(levelIndex: number): string[] {
    const imgs = filterByTaxonomyPath(allImages, taxLabels, taxPath, levelIndex);
    return extractLevelOptions(imgs, taxLabels[levelIndex]);
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

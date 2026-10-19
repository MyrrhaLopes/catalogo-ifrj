import type { TaxonomyPathItem } from "@/frontend/shared/utils/taxonomy";

export function filterByTaxonomyPath<T extends { taxonomyPath: readonly TaxonomyPathItem[] }>(
  items: T[],
  taxLabels: readonly string[],
  taxPath: readonly string[],
  upToLevel = taxPath.length,
): T[] {
  let result = items;
  for (let i = 0; i < upToLevel; i++) {
    const label = taxLabels[i];
    const val = taxPath[i];
    if (label && val) {
      result = result.filter(
        (item) => item.taxonomyPath.find((n) => n.label === label)?.labelValue === val,
      );
    }
  }
  return result;
}

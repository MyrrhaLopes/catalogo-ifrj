export type TaxonomyPathItem = { id?: number; label: string; labelValue: string };

export function getScientificName(
  taxonomyPath: readonly TaxonomyPathItem[],
  fallback = "—",
): string {
  const last = taxonomyPath.at(-1);
  if (!last) return fallback;
  const secondLast = taxonomyPath.at(-2);
  return last.label === "Espécie" && secondLast
    ? `${secondLast.labelValue} ${last.labelValue}`
    : last.labelValue;
}

export function buildTaxonomyBreadcrumb(
  taxonomyPath: readonly TaxonomyPathItem[],
  fallback = "—",
): string {
  return taxonomyPath.map((n) => n.labelValue).join(" > ") || fallback;
}

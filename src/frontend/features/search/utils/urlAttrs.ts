import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import type { ActiveAttrFilter, AttrOperator } from "../components/AttributeFilters";
import { fromBaseUnit, getDefaultDisplayUnit } from "./unitConversion";

export type UrlAttr = { tid: number; val: number; displayUnit: string; op: string };

export function mapUrlAttrsToActiveFilters(
  urlAttrs: readonly UrlAttr[],
  templates: readonly AttributeTemplate[],
): ActiveAttrFilter[] {
  return urlAttrs.flatMap((a) => {
    const template = templates.find((t) => t.id === a.tid);
    if (!template) return [];
    const displayUnit = a.displayUnit || getDefaultDisplayUnit(template.unit);
    const displayValue = fromBaseUnit(a.val, displayUnit, template.unit).toString();
    return [
      { templateId: a.tid, template, displayValue, displayUnit, operator: a.op as AttrOperator },
    ];
  });
}

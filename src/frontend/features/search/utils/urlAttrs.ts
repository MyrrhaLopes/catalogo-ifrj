import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import type { ActiveAttrFilter, AttrOperator } from "../components/AttributeFilters";
import { fromBaseUnit, getDefaultDisplayUnit } from "./unitConversion";

export type UrlAttr =
  | { kind?: "numeric"; tid: number; val: number; val2?: number; displayUnit: string; op: string }
  | { kind: "categorical"; tid: number; values: string[] };

export function mapUrlAttrsToActiveFilters(
  urlAttrs: readonly UrlAttr[],
  templates: readonly AttributeTemplate[],
): ActiveAttrFilter[] {
  return urlAttrs.flatMap((a): ActiveAttrFilter[] => {
    const template = templates.find((t) => t.id === a.tid);
    if (!template) return [];

    if (a.kind === "categorical") {
      return [{ kind: "categorical", templateId: a.tid, template, selectedValues: a.values }];
    }

    const displayUnit = a.displayUnit || getDefaultDisplayUnit(template.unit);
    const displayValue = fromBaseUnit(a.val, displayUnit, template.unit).toString();
    const displayValue2 =
      a.val2 !== undefined ? fromBaseUnit(a.val2, displayUnit, template.unit).toString() : "";
    return [
      {
        kind: "numeric",
        templateId: a.tid,
        template,
        displayValue,
        displayValue2,
        displayUnit,
        operator: a.op as AttrOperator,
      },
    ];
  });
}

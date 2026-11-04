import { describe, it, expect } from "vitest";
import { mapUrlAttrsToActiveFilters, type UrlAttr } from "./urlAttrs";
import type { AttributeTemplate } from "@/frontend/features/species/species.api";
import type { NumericActiveAttrFilter } from "../components/AttributeFilters";

const templates: AttributeTemplate[] = [
  { id: 1, label: "Comprimento corporal", unit: "m", kind: "numeric", options: null },
  { id: 2, label: "Longevidade máxima", unit: "min", kind: "numeric", options: null },
  { id: 3, label: "Status de conservação (IUCN)", unit: "categoria", kind: "categorical", options: ["LC", "NT", "VU"] },
];

function asNumeric(filter: ReturnType<typeof mapUrlAttrsToActiveFilters>[number]): NumericActiveAttrFilter {
  if (filter.kind !== "numeric") throw new Error("esperava um filtro numérico");
  return filter;
}

describe("mapUrlAttrsToActiveFilters", () => {
  it("retorna array vazio para input vazio", () => {
    expect(mapUrlAttrsToActiveFilters([], templates)).toEqual([]);
  });

  it("ignora attrs cujo templateId não existe mais nos templates", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 999, val: 5, displayUnit: "m", op: "=" }];
    expect(mapUrlAttrsToActiveFilters(urlAttrs, templates)).toEqual([]);
  });

  it("mapeia um filtro simples com operador =", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 1, val: 5, displayUnit: "m", op: "=" }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    expect(result).toEqual([
      {
        kind: "numeric",
        templateId: 1,
        template: templates[0],
        displayValue: "5",
        displayValue2: "",
        displayUnit: "m",
        operator: "=",
      },
    ]);
  });

  it("deixa displayValue2 vazio quando val2 não está presente", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 1, val: 5, displayUnit: "m", op: ">=" }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    expect(asNumeric(result[0]).displayValue2).toBe("");
  });

  it("mapeia displayValue2 a partir de val2 para o operador entre", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 1, val: 2, val2: 10, displayUnit: "m", op: "entre" }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    expect(result[0]).toMatchObject({ displayValue: "2", displayValue2: "10", operator: "entre" });
  });

  it("converte val2 para a unidade de exibição, assim como val", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 1, val: 1, val2: 2, displayUnit: "km", op: "entre" }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    const entry = asNumeric(result[0]);
    expect(entry.displayValue).toBe("0.001");
    expect(entry.displayValue2).toBe("0.002");
  });

  it("usa a unidade padrão do template quando displayUnit vem vazio", () => {
    const urlAttrs: UrlAttr[] = [{ tid: 2, val: 5, displayUnit: "", op: "=" }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    expect(asNumeric(result[0]).displayUnit).toBe("min");
  });

  it("mapeia um filtro categórico com os valores selecionados", () => {
    const urlAttrs: UrlAttr[] = [{ kind: "categorical", tid: 3, values: ["LC", "VU"] }];
    const result = mapUrlAttrsToActiveFilters(urlAttrs, templates);
    expect(result).toEqual([
      { kind: "categorical", templateId: 3, template: templates[2], selectedValues: ["LC", "VU"] },
    ]);
  });
});

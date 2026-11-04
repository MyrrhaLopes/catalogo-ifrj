import { describe, it, expect } from "vitest";
import { speciesListQuerySchema } from "./species.schema";

describe("speciesListQuerySchema — campo exposicao (filtro da busca pública)", () => {
  it("é undefined quando não informado", () => {
    expect(speciesListQuerySchema.parse({}).exposicao).toBeUndefined();
  });

  it("converte CSV de um único valor em array", () => {
    expect(speciesListQuerySchema.parse({ exposicao: "humida" }).exposicao).toEqual(["humida"]);
  });

  it("converte CSV de dois valores em array", () => {
    expect(speciesListQuerySchema.parse({ exposicao: "humida,seca" }).exposicao).toEqual([
      "humida",
      "seca",
    ]);
  });

  it("aceita array vindo diretamente do query parser", () => {
    expect(speciesListQuerySchema.parse({ exposicao: ["seca"] }).exposicao).toEqual(["seca"]);
  });

  it("rejeita valor fora do enum", () => {
    expect(() => speciesListQuerySchema.parse({ exposicao: "molhada" })).toThrow();
  });

  it("trata string vazia como ausência do filtro", () => {
    expect(speciesListQuerySchema.parse({ exposicao: "" }).exposicao).toBeUndefined();
  });

  it("aplica defaults de page/pageSize mesmo com exposicao presente", () => {
    const result = speciesListQuerySchema.parse({ exposicao: "seca" });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("combina exposicao com taxNodes e attrs sem interferência", () => {
    const result = speciesListQuerySchema.parse({
      exposicao: "seca",
      taxNodes: "1,2",
      attrs: JSON.stringify([{ templateId: 3, valueInBaseUnit: 10, operator: "=" }]),
    });
    expect(result.exposicao).toEqual(["seca"]);
    expect(result.taxNodes).toEqual([1, 2]);
    expect(result.attrs).toEqual([{ templateId: 3, valueInBaseUnit: 10, operator: "=" }]);
  });
});

describe("speciesListQuerySchema — operadores de attrs (>=, <=, entre)", () => {
  it("aceita o operador >=", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([{ templateId: 1, valueInBaseUnit: 5, operator: ">=" }]),
    });
    expect(result.attrs).toEqual([{ templateId: 1, valueInBaseUnit: 5, operator: ">=" }]);
  });

  it("aceita o operador <=", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([{ templateId: 1, valueInBaseUnit: 5, operator: "<=" }]),
    });
    expect(result.attrs).toEqual([{ templateId: 1, valueInBaseUnit: 5, operator: "<=" }]);
  });

  it("aceita o operador entre com valueInBaseUnit2", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([
        { templateId: 1, valueInBaseUnit: 5, valueInBaseUnit2: 10, operator: "entre" },
      ]),
    });
    expect(result.attrs).toEqual([
      { templateId: 1, valueInBaseUnit: 5, valueInBaseUnit2: 10, operator: "entre" },
    ]);
  });

  it("cai para = quando o operador é inválido", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([{ templateId: 1, valueInBaseUnit: 5, operator: "!=" }]),
    });
    expect(result.attrs).toEqual([{ templateId: 1, valueInBaseUnit: 5, operator: "=" }]);
  });
});

describe("speciesListQuerySchema — attrs categóricos (kind: categorical)", () => {
  it("aceita um attr categórico com values", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([{ kind: "categorical", templateId: 13, values: ["LC", "VU"] }]),
    });
    expect(result.attrs).toEqual([{ kind: "categorical", templateId: 13, values: ["LC", "VU"] }]);
  });

  it("rejeita attr categórico sem nenhum value", () => {
    expect(() =>
      speciesListQuerySchema.parse({
        attrs: JSON.stringify([{ kind: "categorical", templateId: 13, values: [] }]),
      }),
    ).toThrow();
  });

  it("combina um attr numérico e um categórico no mesmo array", () => {
    const result = speciesListQuerySchema.parse({
      attrs: JSON.stringify([
        { templateId: 3, valueInBaseUnit: 5, operator: ">=" },
        { kind: "categorical", templateId: 13, values: ["LC"] },
      ]),
    });
    expect(result.attrs).toEqual([
      { templateId: 3, valueInBaseUnit: 5, operator: ">=" },
      { kind: "categorical", templateId: 13, values: ["LC"] },
    ]);
  });

  it("rejeita quando templateId não é informado no attr categórico", () => {
    expect(() =>
      speciesListQuerySchema.parse({
        attrs: JSON.stringify([{ kind: "categorical", values: ["LC"] }]),
      }),
    ).toThrow();
  });
});

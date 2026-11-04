import { describe, it, expect } from "vitest";
import { createAttributeTemplateSchema, updateAttributeTemplateSchema } from "./attribute_templates.schema";

describe("createAttributeTemplateSchema", () => {
  it("usa kind numeric como default quando não informado", () => {
    const result = createAttributeTemplateSchema.parse({ label: "Massa", unit: "grama" });
    expect(result.kind).toBe("numeric");
  });

  it("aceita um template numérico sem options", () => {
    const result = createAttributeTemplateSchema.parse({ label: "Massa", unit: "grama", kind: "numeric" });
    expect(result.options).toBeUndefined();
  });

  it("rejeita template categórico sem nenhuma option", () => {
    expect(() =>
      createAttributeTemplateSchema.parse({ label: "Status", unit: "categoria", kind: "categorical" }),
    ).toThrow();
  });

  it("rejeita template categórico com array de options vazio", () => {
    expect(() =>
      createAttributeTemplateSchema.parse({
        label: "Status",
        unit: "categoria",
        kind: "categorical",
        options: [],
      }),
    ).toThrow();
  });

  it("aceita template categórico sem unit, com ao menos uma option", () => {
    const result = createAttributeTemplateSchema.parse({
      label: "Status",
      kind: "categorical",
      options: ["LC", "VU"],
    });
    expect(result.options).toEqual(["LC", "VU"]);
    expect(result.unit).toBeUndefined();
  });

  it("rejeita template categórico com unit preenchida", () => {
    expect(() =>
      createAttributeTemplateSchema.parse({
        label: "Status",
        unit: "categoria",
        kind: "categorical",
        options: ["LC", "VU"],
      }),
    ).toThrow();
  });

  it("rejeita template numérico sem unit", () => {
    expect(() => createAttributeTemplateSchema.parse({ label: "Massa", kind: "numeric" })).toThrow();
  });

  it("rejeita template numérico que vem com options preenchidas", () => {
    expect(() =>
      createAttributeTemplateSchema.parse({
        label: "Massa",
        unit: "grama",
        kind: "numeric",
        options: ["1", "2"],
      }),
    ).toThrow();
  });

  it("rejeita label vazio", () => {
    expect(() => createAttributeTemplateSchema.parse({ label: "", unit: "grama" })).toThrow();
  });

  it("rejeita unit vazio", () => {
    expect(() => createAttributeTemplateSchema.parse({ label: "Massa", unit: "" })).toThrow();
  });
});

describe("updateAttributeTemplateSchema", () => {
  it("rejeita um patch totalmente vazio", () => {
    expect(() => updateAttributeTemplateSchema.parse({})).toThrow();
  });

  it("aceita um patch só com label", () => {
    const result = updateAttributeTemplateSchema.parse({ label: "Novo label" });
    expect(result.label).toBe("Novo label");
  });

  it("aceita trocar pra categorical desde que venha com options", () => {
    const result = updateAttributeTemplateSchema.parse({ kind: "categorical", options: ["A", "B"] });
    expect(result.options).toEqual(["A", "B"]);
  });

  it("rejeita trocar pra categorical sem options", () => {
    expect(() => updateAttributeTemplateSchema.parse({ kind: "categorical" })).toThrow();
  });

  it("rejeita trocar pra categorical mandando uma unit preenchida", () => {
    expect(() =>
      updateAttributeTemplateSchema.parse({ kind: "categorical", options: ["A"], unit: "categoria" }),
    ).toThrow();
  });

  it("aceita trocar pra numeric sem options e sem reenviar unit", () => {
    const result = updateAttributeTemplateSchema.parse({ kind: "numeric" });
    expect(result.kind).toBe("numeric");
  });

  it("não valida kind/options quando kind não está no patch (ex: patch só de label)", () => {
    const result = updateAttributeTemplateSchema.parse({ label: "x", options: ["sobra, mas sem kind"] });
    expect(result.label).toBe("x");
  });
});

import { describe, it, expect } from "vitest";
import { getAttributeUnitSuffix } from "./utils";

describe("getAttributeUnitSuffix", () => {
  it("metro → m", () => expect(getAttributeUnitSuffix("metro")).toBe("m"));
  it("centímetro → cm", () => expect(getAttributeUnitSuffix("centímetro")).toBe("cm"));
  it("quilograma → kg", () => expect(getAttributeUnitSuffix("quilograma")).toBe("kg"));
  it("grama → g", () => expect(getAttributeUnitSuffix("grama")).toBe("g"));
  it("ano → ' anos'", () => expect(getAttributeUnitSuffix("ano")).toBe(" anos"));
  it("dia → ' dias'", () => expect(getAttributeUnitSuffix("dia")).toBe(" dias"));
  it("celsius → °C", () => expect(getAttributeUnitSuffix("celsius")).toBe("°C"));
  it("par → ' par'", () => expect(getAttributeUnitSuffix("par")).toBe(" par"));
  it("unidade → sem sufixo", () => expect(getAttributeUnitSuffix("unidade")).toBe(""));
  it("categoria → sem sufixo", () => expect(getAttributeUnitSuffix("categoria")).toBe(""));
  it("ppt → ' ppt'", () => expect(getAttributeUnitSuffix("ppt")).toBe(" ppt"));

  it("unidade desconhecida retorna sem sufixo (fallback)", () => {
    expect(getAttributeUnitSuffix("tonelada")).toBe("");
  });
  it("undefined retorna sem sufixo", () => {
    expect(getAttributeUnitSuffix(undefined)).toBe("");
  });
  it("null retorna sem sufixo", () => {
    expect(getAttributeUnitSuffix(null)).toBe("");
  });
  it("string vazia retorna sem sufixo", () => {
    expect(getAttributeUnitSuffix("")).toBe("");
  });
});

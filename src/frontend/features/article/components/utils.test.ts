import { describe, it, expect } from "vitest";
import { getAttributeUnitSuffix, parseInlineFormatting } from "./utils";

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

describe("parseInlineFormatting", () => {
  it("texto puro sem marcadores retorna um único token de texto", () => {
    expect(parseInlineFormatting("olá mundo")).toEqual([{ type: "text", value: "olá mundo" }]);
  });

  it("string vazia retorna lista vazia", () => {
    expect(parseInlineFormatting("")).toEqual([]);
  });

  it("negrito isolado", () => {
    expect(parseInlineFormatting("**forte**")).toEqual([{ type: "bold", value: "forte" }]);
  });

  it("itálico isolado", () => {
    expect(parseInlineFormatting("*ênfase*")).toEqual([{ type: "italic", value: "ênfase" }]);
  });

  it("citação isolada", () => {
    expect(parseInlineFormatting("[cite:42]")).toEqual([{ type: "cite", id: 42 }]);
  });

  it("negrito e itálico intercalados com texto", () => {
    expect(parseInlineFormatting("a **b** c *d* e")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " c " },
      { type: "italic", value: "d" },
      { type: "text", value: " e" },
    ]);
  });

  it("negrito seguido de citação", () => {
    expect(parseInlineFormatting("**importante** [cite:1]")).toEqual([
      { type: "bold", value: "importante" },
      { type: "text", value: " " },
      { type: "cite", id: 1 },
    ]);
  });

  it("negrito sem fechamento é tratado como texto literal", () => {
    expect(parseInlineFormatting("**sem fim")).toEqual([{ type: "text", value: "**sem fim" }]);
  });

  it("itálico sem fechamento é tratado como texto literal", () => {
    expect(parseInlineFormatting("*sem fim")).toEqual([{ type: "text", value: "*sem fim" }]);
  });

  it("asteriscos soltos sem conteúdo não quebram o parser", () => {
    expect(parseInlineFormatting("****")).toEqual([{ type: "text", value: "****" }]);
  });

  it("negrito duplo não é confundido com dois itálicos", () => {
    expect(parseInlineFormatting("**a** **b**")).toEqual([
      { type: "bold", value: "a" },
      { type: "text", value: " " },
      { type: "bold", value: "b" },
    ]);
  });
});

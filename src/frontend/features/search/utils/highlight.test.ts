import { describe, it, expect } from "vitest";
import { highlightTerms } from "./highlight";

describe("highlightTerms", () => {
  it("envolve o token em <strong> (case-insensitive)", () => {
    expect(highlightTerms("Thalassoma bifasciatum", "thalassoma")).toBe(
      "<strong>Thalassoma</strong> bifasciatum",
    );
  });

  it("lida com múltiplos tokens", () => {
    const result = highlightTerms("pássaro príncipe azul", "pássaro príncipe");
    expect(result).toContain("<strong>pássaro</strong>");
    expect(result).toContain("<strong>príncipe</strong>");
  });

  it("retorna texto inalterado quando não há match", () => {
    expect(highlightTerms("Thalassoma bifasciatum", "rex")).toBe(
      "Thalassoma bifasciatum",
    );
  });

  it("retorna texto inalterado quando query é vazia", () => {
    expect(highlightTerms("Thalassoma bifasciatum", "")).toBe(
      "Thalassoma bifasciatum",
    );
  });

  it("retorna texto inalterado quando query é só espaços", () => {
    expect(highlightTerms("Thalassoma", "   ")).toBe("Thalassoma");
  });

  it("escapa caracteres especiais de regex na query", () => {
    expect(highlightTerms("preço (custo)", "(custo)")).toBe(
      "preço <strong>(custo)</strong>",
    );
  });
});

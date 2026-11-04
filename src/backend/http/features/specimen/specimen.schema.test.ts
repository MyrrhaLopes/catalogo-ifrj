import { describe, it, expect } from "vitest";
import {
  specimenInsertSchema,
  specimenUpdateSchema,
  specimenSearchQuerySchema,
  exposicaoSchema,
} from "./specimen.schema";

describe("exposicaoSchema", () => {
  it("aceita 'seca'", () => {
    expect(exposicaoSchema.parse("seca")).toBe("seca");
  });

  it("aceita 'humida'", () => {
    expect(exposicaoSchema.parse("humida")).toBe("humida");
  });

  it("rejeita valores fora do enum", () => {
    expect(() => exposicaoSchema.parse("molhada")).toThrow();
  });

  it("rejeita número", () => {
    expect(() => exposicaoSchema.parse(1)).toThrow();
  });

  it("rejeita undefined", () => {
    expect(() => exposicaoSchema.parse(undefined)).toThrow();
  });
});

describe("specimenInsertSchema", () => {
  it("aceita payload válido com exposicao 'seca'", () => {
    const result = specimenInsertSchema.parse({ code: "CPINHEXA01", exposicao: "seca" });
    expect(result).toEqual({ code: "CPINHEXA01", exposicao: "seca" });
  });

  it("aceita payload válido com exposicao 'humida' e lot/shelf", () => {
    const result = specimenInsertSchema.parse({
      code: "CPINMOL02",
      exposicao: "humida",
      lot: 2,
      shelf: 1,
    });
    expect(result).toEqual({ code: "CPINMOL02", exposicao: "humida", lot: 2, shelf: 1 });
  });

  it("rejeita quando exposicao está ausente", () => {
    expect(() => specimenInsertSchema.parse({ code: "CPINHEXA01" })).toThrow();
  });

  it("rejeita quando exposicao tem valor inválido", () => {
    expect(() => specimenInsertSchema.parse({ code: "CPINHEXA01", exposicao: "congelada" })).toThrow();
  });

  it("rejeita quando code está vazio", () => {
    expect(() => specimenInsertSchema.parse({ code: "", exposicao: "seca" })).toThrow();
  });
});

describe("specimenUpdateSchema", () => {
  it("aceita patch parcial sem exposicao", () => {
    const result = specimenUpdateSchema.parse({ code: "NOVO-CODIGO" });
    expect(result).toEqual({ code: "NOVO-CODIGO" });
  });

  it("aceita patch apenas com exposicao", () => {
    const result = specimenUpdateSchema.parse({ exposicao: "humida" });
    expect(result).toEqual({ exposicao: "humida" });
  });

  it("aceita objeto vazio (nenhum campo obrigatório no update)", () => {
    expect(specimenUpdateSchema.parse({})).toEqual({});
  });

  it("rejeita exposicao com valor inválido no update", () => {
    expect(() => specimenUpdateSchema.parse({ exposicao: "seca-demais" })).toThrow();
  });
});

describe("specimenSearchQuerySchema — campo exposicao (filtro da busca pública)", () => {
  it("é undefined quando não informado", () => {
    expect(specimenSearchQuerySchema.parse({}).exposicao).toBeUndefined();
  });

  it("converte CSV de um único valor em array", () => {
    expect(specimenSearchQuerySchema.parse({ exposicao: "seca" }).exposicao).toEqual(["seca"]);
  });

  it("converte CSV de dois valores em array", () => {
    expect(specimenSearchQuerySchema.parse({ exposicao: "humida,seca" }).exposicao).toEqual([
      "humida",
      "seca",
    ]);
  });

  it("aceita array vindo diretamente do query parser (express com múltiplos valores)", () => {
    expect(specimenSearchQuerySchema.parse({ exposicao: ["seca", "humida"] }).exposicao).toEqual([
      "seca",
      "humida",
    ]);
  });

  it("rejeita quando o CSV contém um valor fora do enum", () => {
    expect(() => specimenSearchQuerySchema.parse({ exposicao: "seca,molhada" })).toThrow();
  });

  it("trata string vazia como ausência do filtro", () => {
    expect(specimenSearchQuerySchema.parse({ exposicao: "" }).exposicao).toBeUndefined();
  });

  it("combina exposicao com q e page sem interferência entre os campos", () => {
    const result = specimenSearchQuerySchema.parse({ q: "pei", page: "2", exposicao: "humida" });
    expect(result).toEqual({ q: "pei", page: 2, exposicao: ["humida"] });
  });
});

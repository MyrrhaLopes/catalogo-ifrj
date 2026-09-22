import { describe, it, expect } from "vitest";
import { toBaseUnit, fromBaseUnit, getDisplayUnits } from "./unitConversion";

describe("getDisplayUnits", () => {
  it("retorna unidades de metro", () => {
    expect(getDisplayUnits("meter")).toEqual(["cm", "m", "km"]);
  });
  it("retorna unidades de minuto", () => {
    expect(getDisplayUnits("minute")).toEqual(["s", "min", "h"]);
  });
});

describe("toBaseUnit — meter", () => {
  it("converte cm para metros", () => {
    expect(toBaseUnit(100, "cm", "meter")).toBeCloseTo(1);
  });
  it("converte km para metros", () => {
    expect(toBaseUnit(2, "km", "meter")).toBeCloseTo(2000);
  });
  it("m para metros (identidade)", () => {
    expect(toBaseUnit(5, "m", "meter")).toBeCloseTo(5);
  });
  it("valor zero", () => {
    expect(toBaseUnit(0, "cm", "meter")).toBe(0);
  });
  it("valor negativo", () => {
    expect(toBaseUnit(-10, "m", "meter")).toBeCloseTo(-10);
  });
  it("lança erro para unidade inválida", () => {
    expect(() => toBaseUnit(1, "mm" as never, "meter")).toThrow();
  });
});

describe("toBaseUnit — minute", () => {
  it("converte s para minutos", () => {
    expect(toBaseUnit(60, "s", "minute")).toBeCloseTo(1);
  });
  it("converte h para minutos", () => {
    expect(toBaseUnit(2, "h", "minute")).toBeCloseTo(120);
  });
  it("min para minutos (identidade)", () => {
    expect(toBaseUnit(30, "min", "minute")).toBeCloseTo(30);
  });
  it("lança erro para unidade inválida", () => {
    expect(() => toBaseUnit(1, "days" as never, "minute")).toThrow();
  });
});

describe("fromBaseUnit — meter", () => {
  it("converte metros para cm", () => {
    expect(fromBaseUnit(1, "cm", "meter")).toBeCloseTo(100);
  });
  it("converte metros para km", () => {
    expect(fromBaseUnit(2000, "km", "meter")).toBeCloseTo(2);
  });
  it("roundtrip: to e from deve retornar valor original", () => {
    const original = 42.5;
    const inBase = toBaseUnit(original, "cm", "meter");
    expect(fromBaseUnit(inBase, "cm", "meter")).toBeCloseTo(original);
  });
});

describe("fromBaseUnit — minute", () => {
  it("converte minutos para segundos", () => {
    expect(fromBaseUnit(1, "s", "minute")).toBeCloseTo(60);
  });
  it("converte minutos para horas", () => {
    expect(fromBaseUnit(120, "h", "minute")).toBeCloseTo(2);
  });
  it("lança erro para unidade inválida", () => {
    expect(() => fromBaseUnit(1, "days" as never, "minute")).toThrow();
  });
});

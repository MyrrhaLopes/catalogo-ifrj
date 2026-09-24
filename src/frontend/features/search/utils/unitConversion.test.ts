import { describe, it, expect } from "vitest";
import { toBaseUnit, fromBaseUnit, getDisplayUnits, getDefaultDisplayUnit } from "./unitConversion";

describe("getDisplayUnits", () => {
  it("retorna unidades de comprimento para 'meter'", () => {
    expect(getDisplayUnits("meter")).toEqual(["mm", "cm", "m", "km"]);
  });
  it("retorna unidades de comprimento para 'metro' (português)", () => {
    expect(getDisplayUnits("metro")).toEqual(["mm", "cm", "m", "km"]);
  });
  it("retorna unidades de comprimento para 'centímetro'", () => {
    expect(getDisplayUnits("centímetro")).toEqual(["mm", "cm", "m", "km"]);
  });
  it("retorna unidades de comprimento para 'quilômetro'", () => {
    expect(getDisplayUnits("quilômetro")).toEqual(["mm", "cm", "m", "km"]);
  });
  it("retorna unidades de tempo para 'minute'", () => {
    expect(getDisplayUnits("minute")).toEqual(["s", "min", "h"]);
  });
  it("retorna unidades de tempo para 'minuto' (português)", () => {
    expect(getDisplayUnits("minuto")).toEqual(["s", "min", "h"]);
  });
  it("retorna unidades de tempo para 'segundo'", () => {
    expect(getDisplayUnits("segundo")).toEqual(["s", "min", "h"]);
  });
  it("retorna unidades de tempo para 'hora'", () => {
    expect(getDisplayUnits("hora")).toEqual(["s", "min", "h"]);
  });
  it("retorna array com a unidade original para unidade desconhecida", () => {
    expect(getDisplayUnits("kg")).toEqual(["kg"]);
  });
});

describe("getDefaultDisplayUnit", () => {
  it("metro → m", () => expect(getDefaultDisplayUnit("metro")).toBe("m"));
  it("centímetro → cm", () => expect(getDefaultDisplayUnit("centímetro")).toBe("cm"));
  it("quilômetro → km", () => expect(getDefaultDisplayUnit("quilômetro")).toBe("km"));
  it("minuto → min", () => expect(getDefaultDisplayUnit("minuto")).toBe("min"));
  it("segundo → s", () => expect(getDefaultDisplayUnit("segundo")).toBe("s"));
  it("hora → h", () => expect(getDefaultDisplayUnit("hora")).toBe("h"));
  it("meter → m", () => expect(getDefaultDisplayUnit("meter")).toBe("m"));
  it("minute → min", () => expect(getDefaultDisplayUnit("minute")).toBe("min"));
  it("unidade desconhecida retorna a própria string", () => expect(getDefaultDisplayUnit("kg")).toBe("kg"));
});

describe("toBaseUnit — comprimento (base: metros)", () => {
  it("cm para metros", () => expect(toBaseUnit(100, "cm", "metro")).toBeCloseTo(1));
  it("km para metros", () => expect(toBaseUnit(2, "km", "metro")).toBeCloseTo(2000));
  it("mm para metros", () => expect(toBaseUnit(1000, "mm", "metro")).toBeCloseTo(1));
  it("m para metros (identidade)", () => expect(toBaseUnit(5, "m", "metro")).toBeCloseTo(5));
  it("valor zero", () => expect(toBaseUnit(0, "cm", "metro")).toBe(0));
  it("valor negativo", () => expect(toBaseUnit(-10, "m", "metro")).toBeCloseTo(-10));
  it("aceita alias em inglês 'meter'", () => expect(toBaseUnit(100, "cm", "meter")).toBeCloseTo(1));
});

describe("toBaseUnit — comprimento (base: centímetros)", () => {
  it("m para centímetros", () => expect(toBaseUnit(1.5, "m", "centímetro")).toBeCloseTo(150));
  it("km para centímetros", () => expect(toBaseUnit(0.001, "km", "centímetro")).toBeCloseTo(100));
  it("cm para centímetros (identidade)", () => expect(toBaseUnit(42, "cm", "centímetro")).toBeCloseTo(42));
  it("mm para centímetros", () => expect(toBaseUnit(10, "mm", "centímetro")).toBeCloseTo(1));
});

describe("toBaseUnit — tempo (base: minutos)", () => {
  it("s para minutos", () => expect(toBaseUnit(60, "s", "minuto")).toBeCloseTo(1));
  it("h para minutos", () => expect(toBaseUnit(2, "h", "minuto")).toBeCloseTo(120));
  it("min para minutos (identidade)", () => expect(toBaseUnit(30, "min", "minuto")).toBeCloseTo(30));
  it("aceita alias 'segundo'", () => expect(toBaseUnit(60, "segundo", "minuto")).toBeCloseTo(1));
  it("aceita alias 'hora'", () => expect(toBaseUnit(1, "hora", "minuto")).toBeCloseTo(60));
  it("aceita alias em inglês 'minute'", () => expect(toBaseUnit(60, "s", "minute")).toBeCloseTo(1));
});

describe("toBaseUnit — unidades desconhecidas", () => {
  it("retorna o valor sem conversão quando a unidade base é desconhecida", () => {
    expect(toBaseUnit(5, "cm", "kg")).toBe(5);
  });
  it("retorna o valor sem conversão quando a unidade de display é desconhecida", () => {
    expect(toBaseUnit(5, "tonelada", "metro")).toBe(5);
  });
  it("retorna o valor sem conversão quando ambas são desconhecidas", () => {
    expect(toBaseUnit(5, "foo", "bar")).toBe(5);
  });
  it("retorna o valor sem conversão para grupos diferentes (comprimento × tempo)", () => {
    expect(toBaseUnit(5, "m", "minuto")).toBe(5);
  });
});

describe("fromBaseUnit", () => {
  it("metros para cm", () => expect(fromBaseUnit(1, "cm", "metro")).toBeCloseTo(100));
  it("metros para km", () => expect(fromBaseUnit(2000, "km", "metro")).toBeCloseTo(2));
  it("metros para mm", () => expect(fromBaseUnit(1, "mm", "metro")).toBeCloseTo(1000));
  it("minutos para segundos", () => expect(fromBaseUnit(1, "s", "minuto")).toBeCloseTo(60));
  it("minutos para horas", () => expect(fromBaseUnit(120, "h", "minuto")).toBeCloseTo(2));
  it("roundtrip to/from preserva o valor original", () => {
    const original = 42.5;
    expect(fromBaseUnit(toBaseUnit(original, "cm", "metro"), "cm", "metro")).toBeCloseTo(original);
  });
});

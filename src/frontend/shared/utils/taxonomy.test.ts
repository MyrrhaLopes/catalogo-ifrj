import { describe, it, expect } from "vitest";
import { getScientificName, buildTaxonomyBreadcrumb } from "./taxonomy";

describe("getScientificName", () => {
  const taxonomyPath = [
    { id: 1, label: "Gênero", labelValue: "Panthera" },
    { id: 2, label: "Espécie", labelValue: "onca" },
  ];

  it("usa o override quando presente, ignorando o taxonomyPath", () => {
    expect(getScientificName(taxonomyPath, "Nome customizado")).toBe("Nome customizado");
  });

  it("deriva gênero + espécie do taxonomyPath quando override é null", () => {
    expect(getScientificName(taxonomyPath, null)).toBe("Panthera onca");
  });

  it("deriva gênero + espécie do taxonomyPath quando override é undefined", () => {
    expect(getScientificName(taxonomyPath)).toBe("Panthera onca");
  });

  it("ignora override vazio e cai no taxonomyPath", () => {
    expect(getScientificName(taxonomyPath, "")).toBe("Panthera onca");
  });

  it("retorna apenas o último nó quando ele não é do tipo Espécie", () => {
    const genusOnlyPath = [{ id: 1, label: "Gênero", labelValue: "Panthera" }];
    expect(getScientificName(genusOnlyPath)).toBe("Panthera");
  });

  it("retorna o fallback para taxonomyPath vazio e sem override", () => {
    expect(getScientificName([])).toBe("—");
  });

  it("aceita um fallback customizado como terceiro argumento", () => {
    expect(getScientificName([], null, "Espécie")).toBe("Espécie");
  });

  it("retorna o último labelValue quando o nó Espécie não tem penúltimo nó", () => {
    const onlySpecies = [{ id: 1, label: "Espécie", labelValue: "onca" }];
    expect(getScientificName(onlySpecies)).toBe("onca");
  });
});

describe("buildTaxonomyBreadcrumb", () => {
  it("junta os labelValue com ' > '", () => {
    const path = [
      { id: 1, label: "Família", labelValue: "Felidae" },
      { id: 2, label: "Gênero", labelValue: "Panthera" },
    ];
    expect(buildTaxonomyBreadcrumb(path)).toBe("Felidae > Panthera");
  });

  it("retorna o fallback para path vazio", () => {
    expect(buildTaxonomyBreadcrumb([])).toBe("—");
  });
});

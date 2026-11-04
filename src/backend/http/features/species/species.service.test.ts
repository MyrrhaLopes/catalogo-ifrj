import { vi, describe, it, expect } from "vitest";
import type { SQL } from "drizzle-orm";
import {
  groupSpeciesRows,
  getScientificName,
  SPECIES_SERVICE,
  buildAttrFilterCondition,
  buildSearchWhereClause,
  NUMERIC_VALUE_REGEX,
} from "./species.service";
import { db } from "@/backend/db/drizzle";

// Renderiza um SQL do drizzle com os parâmetros inline, só para fins de asserção em teste —
// nunca usado em produção (lá os parâmetros são sempre passados via placeholder, não inline).
function renderSql(query: SQL<unknown>): string {
  return query
    .toQuery({
      escapeName: (name: string) => name,
      escapeParam: (idx: number) => `$${idx + 1}`,
      escapeString: (value: string) => `'${value.replace(/'/g, "''")}'`,
      inlineParams: true,
    } as Parameters<SQL<unknown>["toQuery"]>[0])
    .sql.replace(/\s+/g, " ")
    .trim();
}

// O módulo importa `db` no topo — mock evita tentativa de conexão ao banco
vi.mock("@/backend/db/drizzle", () => ({ db: { delete: vi.fn(), select: vi.fn() } }));

describe("groupSpeciesRows", () => {
  it("retorna array vazio para input vazio", () => {
    expect(groupSpeciesRows([])).toEqual([]);
  });

  it("agrupa múltiplos specimens sob a mesma espécie", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 101, specimenCode: "SP-02", specimenExposicao: "humida" as const, specimenLot: 2, specimenShelf: 3 },
    ];
    const result = groupSpeciesRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].specimens).toHaveLength(2);
    expect(result[0].specimens[0]).toEqual({ id: 100, code: "SP-01", exposicao: "seca", lot: null, shelf: null });
    expect(result[0].specimens[1]).toEqual({ id: 101, code: "SP-02", exposicao: "humida", lot: 2, shelf: 3 });
  });

  it("trata espécie sem specimens (linha de left join nula)", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].specimens).toHaveLength(0);
  });

  it("não adiciona specimen quando specimenCode é null mesmo com specimenId presente", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 5, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(0);
  });

  it("lida com múltiplas espécies distintas", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 2, speciesRoot: 20, scientificNameOverride: null, createdAt: null, createdBy: "u2", specimenId: 200, specimenCode: "SP-02", specimenExposicao: "humida" as const, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual([1, 2]);
    expect(result[0].specimens[0].code).toBe("SP-01");
    expect(result[1].specimens[0].code).toBe("SP-02");
  });

  it("converte createdAt Date para string ISO", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: date, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].createdAt).toBe("2024-01-15T12:00:00.000Z");
  });

  it("retorna null para createdAt null", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].createdAt).toBeNull();
  });

  it("preserva speciesRoot e createdBy de cada espécie", () => {
    const rows = [
      { id: 5, speciesRoot: 99, scientificNameOverride: null, createdAt: null, createdBy: "user-abc", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].speciesRoot).toBe(99);
    expect(result[0].createdBy).toBe("user-abc");
  });

  it("adiciona todas as linhas de um mesmo specimen duplicado (comportamento atual documentado)", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(2);
  });

  it("não adiciona specimen quando specimenExposicao é null mesmo com code presente", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: null, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(0);
  });

  it("preserva o scientificNameOverride de cada espécie", () => {
    const rows = [
      { id: 1, speciesRoot: 10, scientificNameOverride: "Panthera onca", createdAt: null, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].scientificNameOverride).toBe("Panthera onca");
  });
});

describe("getScientificName", () => {
  const taxonomyPath = [
    { label: "Gênero", labelValue: "Panthera" },
    { label: "Espécie", labelValue: "onca" },
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
    const genusOnlyPath = [{ label: "Gênero", labelValue: "Panthera" }];
    expect(getScientificName(genusOnlyPath)).toBe("Panthera");
  });

  it("retorna string vazia para taxonomyPath vazio e sem override", () => {
    expect(getScientificName([])).toBe("");
  });

  it("retorna o último labelValue quando o nó Espécie não tem penúltimo nó", () => {
    const onlySpecies = [{ label: "Espécie", labelValue: "onca" }];
    expect(getScientificName(onlySpecies)).toBe("onca");
  });
});

describe("SPECIES_SERVICE.setScientificName", () => {
  it("atualiza a coluna scientificNameOverride com o valor informado", async () => {
    const whereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(db as unknown as { update: ReturnType<typeof vi.fn> }).update = vi.fn().mockReturnValue({ set: setMock });

    await SPECIES_SERVICE.setScientificName(1, "Panthera onca");

    expect(setMock).toHaveBeenCalledWith({ scientificNameOverride: "Panthera onca" });
  });

  it("limpa a coluna scientificNameOverride quando recebe null", async () => {
    const whereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(db as unknown as { update: ReturnType<typeof vi.fn> }).update = vi.fn().mockReturnValue({ set: setMock });

    await SPECIES_SERVICE.setScientificName(1, null);

    expect(setMock).toHaveBeenCalledWith({ scientificNameOverride: null });
  });
});

describe("SPECIES_SERVICE.deleteSpecie", () => {
  it("resolve normalmente quando a exclusão não tem registros vinculados", async () => {
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    await expect(SPECIES_SERVICE.deleteSpecie(1)).resolves.toBeUndefined();
  });

  it("propaga erros inesperados do banco sem traduzi-los (a exclusão agora é em cascata)", async () => {
    const unexpectedError = new Error("connection lost");
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockRejectedValue(unexpectedError),
    } as never);

    await expect(SPECIES_SERVICE.deleteSpecie(1)).rejects.toBe(unexpectedError);
  });
});

describe("SPECIES_SERVICE.getDeleteImpact", () => {
  function mockSelectChain(resultsInCallOrder: Array<{ count: number }[]>) {
    let i = 0;
    const chain = {
      from: () => chain,
      innerJoin: () => chain,
      where: () => Promise.resolve(resultsInCallOrder[i++]),
    };
    vi.mocked(db.select).mockImplementation(() => chain as unknown as ReturnType<typeof db.select>);
  }

  it("agrega as contagens de artigo, atributos, nomes populares, specimens e imagens", async () => {
    mockSelectChain([
      [{ count: 1 }], // article
      [{ count: 3 }], // attrs
      [{ count: 2 }], // popularNames
      [{ count: 4 }], // specimens
      [{ count: 5 }], // images
    ]);

    const impact = await SPECIES_SERVICE.getDeleteImpact(1);

    expect(impact).toEqual({
      hasArticle: true,
      attributesCount: 3,
      popularNamesCount: 2,
      specimensCount: 4,
      imagesCount: 5,
    });
  });

  it("retorna hasArticle false e contagens 0 quando nada está vinculado", async () => {
    mockSelectChain([
      [], // article
      [], // attrs
      [], // popularNames
      [], // specimens
      [], // images
    ]);

    const impact = await SPECIES_SERVICE.getDeleteImpact(1);

    expect(impact).toEqual({
      hasArticle: false,
      attributesCount: 0,
      popularNamesCount: 0,
      specimensCount: 0,
      imagesCount: 0,
    });
  });
});

// Regressão do bug documentado em todos/10-busca-atributos-500-e-lista-scroll.md: o seed real
// tem valores de atributo não numéricos (ex: "1 a 5", "LC", "80 (em cativeiro...)") e um CAST
// direto para NUMERIC lançava uma exceção do Postgres (22P02) que virava um 500 genérico.
describe("NUMERIC_VALUE_REGEX (guarda usada antes do CAST para numeric)", () => {
  it.each([
    ["5", true],
    ["5.5", true],
    ["-5", true],
    ["-5.25", true],
    ["0", true],
    ["1 a 5", false],
    ["LC", false],
    ["DD", false],
    ["80 (em cativeiro, Heteractis magnifica)", false],
    ["0.3-1.5", false],
    ["200 a 300, excepcionalmente até 800", false],
    ["até 25", false],
    ["", false],
    ["5.", false],
    [".5", false],
  ])("valor %p é numérico? %p", (value, expected) => {
    expect(NUMERIC_VALUE_REGEX.test(value)).toBe(expected);
  });
});

describe("buildAttrFilterCondition", () => {
  it("protege o CAST com um CASE WHEN que valida o formato numérico antes de converter", () => {
    const rendered = renderSql(buildAttrFilterCondition({ templateId: 1, valueInBaseUnit: 5 }));
    expect(rendered).toContain("CASE WHEN attr_f.value ~");
    expect(rendered).toContain("THEN attr_f.value::numeric END");
    expect(rendered).not.toMatch(/CAST\(attr_f\.value AS NUMERIC\)/);
  });

  it("usa = como operador padrão quando operator não é informado", () => {
    const rendered = renderSql(buildAttrFilterCondition({ templateId: 7, valueInBaseUnit: 12 }));
    expect(rendered).toContain("attr_f.attribute = 7");
    expect(rendered).toMatch(/END\) = 12/);
  });

  it("usa o operador > quando informado", () => {
    const rendered = renderSql(
      buildAttrFilterCondition({ templateId: 1, valueInBaseUnit: 3, operator: ">" }),
    );
    expect(rendered).toMatch(/END\) > 3/);
  });

  it("usa o operador < quando informado", () => {
    const rendered = renderSql(
      buildAttrFilterCondition({ templateId: 1, valueInBaseUnit: 3, operator: "<" }),
    );
    expect(rendered).toMatch(/END\) < 3/);
  });
});

describe("buildSearchWhereClause", () => {
  it("retorna TRUE quando nenhum filtro é informado", () => {
    expect(renderSql(buildSearchWhereClause())).toBe("TRUE");
  });

  it("não inclui a condição de exposição quando exposicao não é informado", () => {
    const rendered = renderSql(buildSearchWhereClause(undefined, undefined, undefined, undefined));
    expect(rendered).not.toContain("sp_ex");
  });

  it("não inclui a condição de exposição quando exposicao é um array vazio", () => {
    const rendered = renderSql(buildSearchWhereClause(undefined, undefined, undefined, []));
    expect(rendered).not.toContain("sp_ex");
  });

  it("inclui NOT EXISTS OR EXISTS para o filtro de exposição, nunca um EXISTS puro", () => {
    const rendered = renderSql(buildSearchWhereClause(undefined, undefined, undefined, ["seca"]));
    expect(rendered).toContain("NOT EXISTS (SELECT 1 FROM specimens sp_ex WHERE sp_ex.species_id = s.id)");
    expect(rendered).toContain("sp_ex.exposicao = ANY('{seca}'::text[])");
  });

  it("monta o literal de array com as duas exposições quando ambas são selecionadas", () => {
    const rendered = renderSql(
      buildSearchWhereClause(undefined, undefined, undefined, ["humida", "seca"]),
    );
    expect(rendered).toContain("sp_ex.exposicao = ANY('{humida,seca}'::text[])");
  });

  it("combina múltiplos filtros (taxNodes + attrs + exposicao) com AND", () => {
    const rendered = renderSql(
      buildSearchWhereClause(undefined, [10], [{ templateId: 2, valueInBaseUnit: 1 }], ["seca"]),
    );
    expect(rendered).toContain("tp_f.node_id = 10");
    expect(rendered).toContain("attr_f.attribute = 2");
    expect(rendered).toContain("sp_ex.exposicao = ANY");
    // as três condições devem estar unidas por AND, não apenas concatenadas
    expect(rendered.match(/\bAND\b/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});

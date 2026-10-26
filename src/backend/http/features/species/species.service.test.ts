import { vi, describe, it, expect } from "vitest";
import { groupSpeciesRows, SPECIES_SERVICE } from "./species.service";
import { db } from "@/backend/db/drizzle";

// O módulo importa `db` no topo — mock evita tentativa de conexão ao banco
vi.mock("@/backend/db/drizzle", () => ({ db: { delete: vi.fn(), select: vi.fn() } }));

describe("groupSpeciesRows", () => {
  it("retorna array vazio para input vazio", () => {
    expect(groupSpeciesRows([])).toEqual([]);
  });

  it("agrupa múltiplos specimens sob a mesma espécie", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 101, specimenCode: "SP-02", specimenExposicao: "humida" as const, specimenLot: 2, specimenShelf: 3 },
    ];
    const result = groupSpeciesRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].specimens).toHaveLength(2);
    expect(result[0].specimens[0]).toEqual({ id: 100, code: "SP-01", exposicao: "seca", lot: null, shelf: null });
    expect(result[0].specimens[1]).toEqual({ id: 101, code: "SP-02", exposicao: "humida", lot: 2, shelf: 3 });
  });

  it("trata espécie sem specimens (linha de left join nula)", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].specimens).toHaveLength(0);
  });

  it("não adiciona specimen quando specimenCode é null mesmo com specimenId presente", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 5, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(0);
  });

  it("lida com múltiplas espécies distintas", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 2, speciesRoot: 20, createdAt: null, createdBy: "u2", specimenId: 200, specimenCode: "SP-02", specimenExposicao: "humida" as const, specimenLot: null, specimenShelf: null },
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
      { id: 1, speciesRoot: 10, createdAt: date, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].createdAt).toBe("2024-01-15T12:00:00.000Z");
  });

  it("retorna null para createdAt null", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].createdAt).toBeNull();
  });

  it("preserva speciesRoot e createdBy de cada espécie", () => {
    const rows = [
      { id: 5, speciesRoot: 99, createdAt: null, createdBy: "user-abc", specimenId: null, specimenCode: null, specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].speciesRoot).toBe(99);
    expect(result[0].createdBy).toBe("user-abc");
  });

  it("adiciona todas as linhas de um mesmo specimen duplicado (comportamento atual documentado)", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: "seca" as const, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(2);
  });

  it("não adiciona specimen quando specimenExposicao é null mesmo com code presente", () => {
    const rows = [
      { id: 1, speciesRoot: 10, createdAt: null, createdBy: "u1", specimenId: 100, specimenCode: "SP-01", specimenExposicao: null, specimenLot: null, specimenShelf: null },
    ];
    const result = groupSpeciesRows(rows);
    expect(result[0].specimens).toHaveLength(0);
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
    return vi.fn(() => chain) as unknown as typeof db.select;
  }

  it("agrega as contagens de artigo, atributos, nomes populares, specimens e imagens", async () => {
    vi.mocked(db).select = mockSelectChain([
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
    vi.mocked(db).select = mockSelectChain([
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
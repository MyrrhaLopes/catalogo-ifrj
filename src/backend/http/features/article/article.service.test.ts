import { vi, describe, it, expect } from "vitest";
import { extractSourceIds } from "./article.service";
import type { ArticleContent } from "./article.schema";

vi.mock("@/backend/db/drizzle", () => ({ db: {} }));

function makeContent(sections: ArticleContent["sections"]): ArticleContent {
  return { sections };
}

describe("extractSourceIds", () => {
  it("retorna array vazio para seções vazias", () => {
    expect(extractSourceIds(makeContent({}))).toEqual([]);
  });

  it("retorna array vazio quando não há blocos de texto", () => {
    const content = makeContent({
      center: [{ type: "image", content: "https://img.com/a.jpg" }],
    });
    expect(extractSourceIds(content)).toEqual([]);
  });

  it("ignora itens string (TOC, SOURCES, PROPERTIES)", () => {
    const content = makeContent({ left: ["TOC", "SOURCES", "PROPERTIES"] });
    expect(extractSourceIds(content)).toEqual([]);
  });

  it("extrai ID único de um bloco de texto", () => {
    const content = makeContent({
      center: [{ type: "text", content: "Texto com [cite:5]." }],
    });
    expect(extractSourceIds(content)).toEqual([5]);
  });

  it("extrai múltiplos IDs em ordem de aparição", () => {
    const content = makeContent({
      center: [{ type: "text", content: "[cite:3] e depois [cite:1] e [cite:7]" }],
    });
    expect(extractSourceIds(content)).toEqual([3, 1, 7]);
  });

  it("deduplica cites repetidos preservando a ordem do primeiro", () => {
    const content = makeContent({
      center: [{ type: "text", content: "[cite:2] depois [cite:2] e [cite:5] depois [cite:2]" }],
    });
    expect(extractSourceIds(content)).toEqual([2, 5]);
  });

  it("combina cites de múltiplos blocos na mesma seção", () => {
    const content = makeContent({
      center: [
        { type: "text", content: "[cite:1]" },
        { type: "text", content: "[cite:2]" },
      ],
    });
    expect(extractSourceIds(content)).toEqual([1, 2]);
  });

  it("combina cites de múltiplas seções (left, center, right)", () => {
    const content = makeContent({
      left: [{ type: "text", content: "[cite:10]" }],
      center: [{ type: "text", content: "[cite:20]" }],
      right: [{ type: "text", content: "[cite:30]" }],
    });
    expect(extractSourceIds(content)).toEqual([10, 20, 30]);
  });

  it("extrai cites de blocos de coluna (nested)", () => {
    const content = makeContent({
      center: [
        {
          type: "column",
          columns: [
            [{ type: "text", content: "[cite:4]" }],
            [{ type: "text", content: "[cite:8]" }],
          ],
        },
      ],
    });
    expect(extractSourceIds(content)).toEqual([4, 8]);
  });

  it("deduplica cites que aparecem em colunas diferentes", () => {
    const content = makeContent({
      center: [
        {
          type: "column",
          columns: [
            [{ type: "text", content: "[cite:99]" }],
            [{ type: "text", content: "[cite:99] e [cite:1]" }],
          ],
        },
      ],
    });
    expect(extractSourceIds(content)).toEqual([99, 1]);
  });

  it("ignora blocos de imagem dentro de colunas", () => {
    const content = makeContent({
      center: [
        {
          type: "column",
          columns: [
            [{ type: "image", content: "https://img.com/b.jpg" }],
          ],
        },
      ],
    });
    expect(extractSourceIds(content)).toEqual([]);
  });

  it("não confunde padrões parciais como [cite:abc] ou [cite:]", () => {
    const content = makeContent({
      center: [{ type: "text", content: "[cite:] e [cite:abc] mas [cite:42] sim" }],
    });
    expect(extractSourceIds(content)).toEqual([42]);
  });

  it("extrai cite no início e no fim do texto", () => {
    const content = makeContent({
      center: [{ type: "text", content: "[cite:1] começo e fim [cite:2]" }],
    });
    expect(extractSourceIds(content)).toEqual([1, 2]);
  });

  it("deduplica cites entre seções", () => {
    const content = makeContent({
      left: [{ type: "text", content: "[cite:5]" }],
      center: [{ type: "text", content: "[cite:5] e [cite:6]" }],
    });
    expect(extractSourceIds(content)).toEqual([5, 6]);
  });

  it("lida com seção undefined sem lançar erro", () => {
    const content = makeContent({ center: undefined });
    expect(extractSourceIds(content)).toEqual([]);
  });

  it("retorna array vazio para texto sem nenhum cite", () => {
    const content = makeContent({
      center: [{ type: "text", content: "Texto sem referências." }],
    });
    expect(extractSourceIds(content)).toEqual([]);
  });
});

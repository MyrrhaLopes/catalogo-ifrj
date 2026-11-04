import { describe, it, expect } from "vitest";
import {
  extractImageUrlsFromBlock,
  extractDeletedImageUrls,
  blockToDraftItem,
  draftItemToBlock,
  initSections,
  toDraftContent,
  normalizeStoredSections,
  type DraftBlockItem,
  type DraftColumnItem,
  type DraftDefaultItem,
  type DraftItem,
  type DraftSections,
} from "./useArticleEditor";
import {
  columnContainerId,
  findItemLocation,
  insertIntoColumn,
  moveDraftItem,
  removeFromColumn,
  resolveContainerId,
  updateInColumn,
} from "../components/editor/draftTree";
import { articleContent, type ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleBlock } from "../components/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const text = (id: string, content = id): DraftBlockItem => ({ id, kind: "block", block: { type: "text", content } });
const image = (id: string, url = `https://x/${id}.png`): DraftBlockItem => ({ id, kind: "block", block: { type: "image", content: url } });
const column = (id: string, columns: DraftBlockItem[][]): DraftColumnItem => ({ id, kind: "column", columns });
const def = (id: string, name: DraftDefaultItem["name"], disabled = false): DraftDefaultItem => ({ id, kind: "default", name, disabled });

function makeSections(partial: Partial<DraftSections> = {}): DraftSections {
  return { left: [], center: [], right: [], ...partial };
}

const ids = (items: DraftItem[]) => items.map((i) => i.id);
const colIds = (sections: DraftSections, section: keyof DraftSections, columnId: string) => {
  const col = sections[section].find((i) => i.id === columnId) as DraftColumnItem;
  return col.columns.map((c) => c.map((x) => x.id));
};

function article(content: ArticleContent) {
  return { id: 1, content };
}

// ---------------------------------------------------------------------------

describe("useArticleEditor helpers", () => {
  describe("extractImageUrlsFromBlock", () => {
    it("extrai URL de bloco de imagem", () => {
      const block: ArticleBlock = { type: "image", content: "https://example.com/img.png" };
      expect(extractImageUrlsFromBlock(block)).toEqual(["https://example.com/img.png"]);
    });

    it("retorna vazio para bloco de texto", () => {
      const block: ArticleBlock = { type: "text", content: "Texto qualquer" };
      expect(extractImageUrlsFromBlock(block)).toEqual([]);
    });

    it("extrai recursivamente de bloco de coluna", () => {
      const block: ArticleBlock = {
        type: "column",
        columns: [
          [
            { type: "image", content: "https://example.com/a.jpg" },
            { type: "text", content: "Legenda" },
          ],
          [{ type: "image", content: "https://example.com/b.jpg" }],
        ],
      };
      expect(extractImageUrlsFromBlock(block)).toEqual([
        "https://example.com/a.jpg",
        "https://example.com/b.jpg",
      ]);
    });
  });

  describe("extractDeletedImageUrls", () => {
    it("combina e deduplica URLs de múltiplos blocos deletados", () => {
      const deletedBlocks: ArticleBlock[] = [
        { type: "image", content: "https://example.com/1.jpg" },
        { type: "text", content: "Texto" },
        { type: "image", content: "https://example.com/1.jpg" },
        { type: "column", columns: [[{ type: "image", content: "https://example.com/2.jpg" }]] },
      ];
      expect(extractDeletedImageUrls(deletedBlocks)).toEqual([
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ]);
    });
  });
});

describe("conversão draft <-> ArticleBlock", () => {
  it("bloco de texto/imagem vira item 'block' com id", () => {
    const item = blockToDraftItem({ type: "text", content: "a" });
    expect(item.kind).toBe("block");
    expect(item.id).toMatch(/^draft-/);
    expect(draftItemToBlock(item)).toEqual({ type: "text", content: "a" });
  });

  it("coluna ganha filhos com ids estáveis e únicos", () => {
    const block: ArticleBlock = {
      type: "column",
      columns: [[{ type: "text", content: "a" }, { type: "image", content: "u" }], [{ type: "text", content: "b" }]],
    };
    const item = blockToDraftItem(block) as DraftColumnItem;
    expect(item.kind).toBe("column");
    const childIds = item.columns.flat().map((c) => c.id);
    expect(childIds).toHaveLength(3);
    expect(new Set([...childIds, item.id]).size).toBe(4);
  });

  it("ida e volta preserva a estrutura (inclusive coluna vazia e coluna aninhada legada)", () => {
    const block: ArticleBlock = {
      type: "column",
      columns: [
        [{ type: "text", content: "a" }],
        [],
        [{ type: "column", columns: [[{ type: "image", content: "deep" }]] }],
      ],
    };
    expect(draftItemToBlock(blockToDraftItem(block))).toEqual(block);
  });
});

describe("initSections / toDraftContent (blocos padrão)", () => {
  it("artigo nulo gera os 3 defaults visíveis nas seções padrão", () => {
    const s = initSections(null);
    expect(s.left).toMatchObject([{ kind: "default", name: "TOC", disabled: false }]);
    expect(s.center).toMatchObject([{ kind: "default", name: "SOURCES", disabled: false }]);
    expect(s.right).toMatchObject([{ kind: "default", name: "PROPERTIES", disabled: false }]);
  });

  it("formato legado: string = visível; default ausente = visível por padrão", () => {
    const s = initSections(article({ sections: { left: ["TOC"], center: [{ type: "text", content: "x" }] } }));
    expect(s.left).toMatchObject([{ kind: "default", name: "TOC", disabled: false }]);
    expect(s.center).toMatchObject([{ kind: "block" }, { kind: "default", name: "SOURCES", disabled: false }]);
    expect(s.right).toMatchObject([{ kind: "default", name: "PROPERTIES", disabled: false }]);
  });

  it("formato novo: objeto default respeita 'disabled' e a seção onde está", () => {
    const s = initSections(
      article({
        sections: {
          left: [{ type: "default", name: "PROPERTIES", disabled: true }],
          center: [{ type: "default", name: "TOC", disabled: false }, { type: "default", name: "SOURCES", disabled: true }],
        },
      }),
    );
    expect(s.left).toMatchObject([{ name: "PROPERTIES", disabled: true }]);
    expect(s.center).toMatchObject([{ name: "TOC", disabled: false }, { name: "SOURCES", disabled: true }]);
    expect(s.right).toEqual([]);
  });

  it("default duplicado (legado + novo) é mantido uma única vez", () => {
    const s = initSections(
      article({ sections: { left: ["TOC", { type: "default", name: "TOC", disabled: true }] } }),
    );
    const tocs = [...s.left, ...s.center, ...s.right].filter((i) => i.kind === "default" && i.name === "TOC");
    expect(tocs).toHaveLength(1);
    expect(tocs[0]).toMatchObject({ disabled: false });
  });

  it("default desabilitado permanece no array ao salvar (não é removido)", () => {
    const content = toDraftContent(
      makeSections({ left: [def("a", "TOC", true)], center: [text("t")], right: [def("b", "PROPERTIES", true)] }),
    );
    expect(content.sections.left).toEqual([{ type: "default", name: "TOC", disabled: true }]);
    expect(content.sections.right).toEqual([{ type: "default", name: "PROPERTIES", disabled: true }]);
    expect(content.sections.left).toHaveLength(1);
  });

  it("toDraftContent converte colunas de volta para ArticleBlock e passa no schema", () => {
    const content = toDraftContent(makeSections({ center: [column("c", [[text("a")], [image("b", "u")]])] }));
    expect(content.sections.center).toEqual([
      { type: "column", columns: [[{ type: "text", content: "a" }], [{ type: "image", content: "u" }]] },
    ]);
    expect(articleContent.safeParse(content).success).toBe(true);
  });

  it("salvar e recarregar preserva estado dos defaults e estrutura", () => {
    const original = initSections(
      article({
        sections: {
          left: [{ type: "default", name: "TOC", disabled: true }],
          center: [{ type: "column", columns: [[{ type: "text", content: "a" }], []] }, "SOURCES"],
        },
      }),
    );
    const saved = toDraftContent(original);
    const reloaded = toDraftContent(initSections(article(saved)));
    expect(reloaded).toEqual(saved);
  });
});

describe("schema articleContent", () => {
  it("aceita formato legado (string) e novo (objeto)", () => {
    expect(articleContent.safeParse({ sections: { left: ["TOC"] } }).success).toBe(true);
    expect(
      articleContent.safeParse({ sections: { left: [{ type: "default", name: "TOC", disabled: true }] } }).success,
    ).toBe(true);
  });

  it("aplica disabled=false por padrão quando o campo está ausente", () => {
    const parsed = articleContent.parse({ sections: { left: [{ type: "default", name: "SOURCES" }] } });
    expect(parsed.sections.left).toEqual([{ type: "default", name: "SOURCES", disabled: false }]);
  });

  it("rejeita nome de default inválido e disabled não booleano", () => {
    expect(articleContent.safeParse({ sections: { left: ["FOO"] } }).success).toBe(false);
    expect(
      articleContent.safeParse({ sections: { left: [{ type: "default", name: "FOO", disabled: false }] } }).success,
    ).toBe(false);
    expect(
      articleContent.safeParse({ sections: { left: [{ type: "default", name: "TOC", disabled: "sim" }] } }).success,
    ).toBe(false);
  });
});

describe("normalizeStoredSections (draft do localStorage)", () => {
  it("retorna null para formatos inválidos", () => {
    expect(normalizeStoredSections(undefined)).toBeNull();
    expect(normalizeStoredSections("x")).toBeNull();
    expect(normalizeStoredSections({ left: [], center: [] })).toBeNull();
    expect(normalizeStoredSections({ left: [{ foo: 1 }], center: [], right: [] })).toBeNull();
    expect(
      normalizeStoredSections({ left: [{ id: "c", kind: "column", columns: [[{ id: 1 }]] }], center: [], right: [] }),
    ).toBeNull();
  });

  it("migra draft legado em que a coluna era um 'block' sem ids nos filhos", () => {
    const legacy = {
      left: [{ id: "d1", kind: "default", name: "TOC", disabled: false }],
      center: [{ id: "c1", kind: "block", block: { type: "column", columns: [[{ type: "text", content: "a" }]] } }],
      right: [],
    };
    const s = normalizeStoredSections(legacy)!;
    expect(s.center[0]).toMatchObject({ id: "c1", kind: "column" });
    const col = s.center[0] as DraftColumnItem;
    expect(col.columns[0][0]).toMatchObject({ kind: "block", block: { type: "text", content: "a" } });
    expect(col.columns[0][0].id).toMatch(/^draft-/);
    // defaults ausentes são completados
    expect([...s.center, ...s.right].some((i) => i.kind === "default" && i.name === "PROPERTIES")).toBe(true);
  });

  it("mantém o formato novo intacto", () => {
    const current = makeSections({
      left: [def("d1", "TOC")],
      center: [column("c1", [[text("a")], []]), def("d2", "SOURCES", true)],
      right: [def("d3", "PROPERTIES")],
    });
    expect(normalizeStoredSections(JSON.parse(JSON.stringify(current)))).toEqual(current);
  });
});

describe("resolveContainerId / findItemLocation", () => {
  const s = makeSections({ center: [text("t1"), column("c1", [[text("a")], [text("b")]])] });

  it("resolve seções e sub-colunas existentes", () => {
    expect(resolveContainerId(s, "center")).toEqual({ kind: "section", section: "center" });
    expect(resolveContainerId(s, columnContainerId("c1", 1))).toEqual({ kind: "column", columnId: "c1", colIndex: 1 });
  });

  it("retorna null para containers inexistentes ou índices fora do intervalo", () => {
    expect(resolveContainerId(s, "foo")).toBeNull();
    expect(resolveContainerId(s, columnContainerId("c1", 2))).toBeNull();
    expect(resolveContainerId(s, columnContainerId("c1", -1))).toBeNull();
    expect(resolveContainerId(s, columnContainerId("nope", 0))).toBeNull();
    expect(resolveContainerId(s, "column:")).toBeNull();
  });

  it("encontra itens aninhados em colunas", () => {
    expect(findItemLocation(s, "b")).toMatchObject({ container: { kind: "column", columnId: "c1", colIndex: 1 }, index: 0 });
    expect(findItemLocation(s, "missing")).toBeNull();
  });
});

describe("moveDraftItem", () => {
  it("reordena na mesma seção", () => {
    const s = makeSections({ center: [text("a"), text("b"), text("c")] });
    expect(ids(moveDraftItem(s, "a", "c").center)).toEqual(["b", "c", "a"]);
    expect(ids(moveDraftItem(s, "c", "a").center)).toEqual(["c", "a", "b"]);
  });

  it("soltar sobre a própria seção leva o item para o FIM (bug do índice -1)", () => {
    const s = makeSections({ center: [text("a"), text("b"), text("c")] });
    expect(ids(moveDraftItem(s, "a", "center").center)).toEqual(["b", "c", "a"]);
  });

  it("soltar sobre a própria sub-coluna leva o item para o fim da coluna", () => {
    const s = makeSections({ center: [column("c1", [[text("a"), text("b"), text("c")], []])] });
    const next = moveDraftItem(s, "a", columnContainerId("c1", 0));
    expect(colIds(next, "center", "c1")).toEqual([["b", "c", "a"], []]);
  });

  it("move entre seções (inserindo na posição do alvo ou no fim)", () => {
    const s = makeSections({ left: [text("a")], right: [text("x"), text("y")] });
    expect(ids(moveDraftItem(s, "a", "y").right)).toEqual(["x", "a", "y"]);
    const toEnd = moveDraftItem(s, "a", "right");
    expect(ids(toEnd.right)).toEqual(["x", "y", "a"]);
    expect(toEnd.left).toEqual([]);
  });

  it("move bloco de nível superior para dentro de uma coluna", () => {
    const s = makeSections({ center: [text("t"), column("c1", [[text("a")], []])] });
    const intoEmpty = moveDraftItem(s, "t", columnContainerId("c1", 1));
    expect(ids(intoEmpty.center)).toEqual(["c1"]);
    expect(colIds(intoEmpty, "center", "c1")).toEqual([["a"], ["t"]]);

    const beforeA = moveDraftItem(s, "t", "a");
    expect(colIds(beforeA, "center", "c1")).toEqual([["t", "a"], []]);
  });

  it("move bloco de dentro de uma coluna para o nível superior", () => {
    const s = makeSections({ left: [text("l")], center: [column("c1", [[image("a"), text("b")], []])] });
    const out = moveDraftItem(s, "a", "l");
    expect(ids(out.left)).toEqual(["a", "l"]);
    expect(colIds(out, "center", "c1")).toEqual([["b"], []]);
    // O bloco movido mantém conteúdo e id
    expect(out.left[0]).toEqual(image("a"));

    const toSectionEnd = moveDraftItem(s, "b", "center");
    expect(ids(toSectionEnd.center)).toEqual(["c1", "b"]);
  });

  it("move entre sub-colunas e entre colunas diferentes", () => {
    const s = makeSections({
      center: [column("c1", [[text("a")], [text("b")]]), column("c2", [[text("x")]])],
    });
    expect(colIds(moveDraftItem(s, "a", "b"), "center", "c1")).toEqual([[], ["a", "b"]]);
    const across = moveDraftItem(s, "a", "x");
    expect(colIds(across, "center", "c1")).toEqual([[], ["b"]]);
    expect(colIds(across, "center", "c2")).toEqual([["a", "x"]]);
  });

  it("reordena dentro de uma coluna", () => {
    const s = makeSections({ right: [column("c1", [[text("a"), text("b"), text("c")]])] });
    expect(colIds(moveDraftItem(s, "c", "a"), "right", "c1")).toEqual([["c", "a", "b"]]);
    expect(colIds(moveDraftItem(s, "a", "b"), "right", "c1")).toEqual([["b", "a", "c"]]);
  });

  it("rejeita bloco padrão sendo movido para dentro de uma coluna", () => {
    const s = makeSections({ left: [def("toc", "TOC")], center: [column("c1", [[text("a")]])] });
    expect(moveDraftItem(s, "toc", columnContainerId("c1", 0))).toBe(s);
    expect(moveDraftItem(s, "toc", "a")).toBe(s);
  });

  it("rejeita coluna sendo movida para dentro de outra coluna (ou dela mesma)", () => {
    const s = makeSections({ center: [column("c1", [[text("a")]]), column("c2", [[]])] });
    expect(moveDraftItem(s, "c1", columnContainerId("c2", 0))).toBe(s);
    expect(moveDraftItem(s, "c1", columnContainerId("c1", 0))).toBe(s);
    expect(moveDraftItem(s, "c2", "a")).toBe(s);
  });

  it("ignora ids desconhecidos e auto-alvo", () => {
    const s = makeSections({ center: [text("a")] });
    expect(moveDraftItem(s, "nope", "center")).toBe(s);
    expect(moveDraftItem(s, "a", "nope")).toBe(s);
    expect(moveDraftItem(s, "a", "a")).toBe(s);
    expect(moveDraftItem(s, "a", "center")).toBe(s); // já é o último
  });

  it("respeita a fase do drag (over só cruza containers, end só reordena)", () => {
    const s = makeSections({ left: [text("a"), text("b")], right: [text("x")] });
    expect(moveDraftItem(s, "a", "b", "over")).toBe(s);
    expect(moveDraftItem(s, "a", "x", "end")).toBe(s);
    expect(ids(moveDraftItem(s, "a", "b", "end").left)).toEqual(["b", "a"]);
    expect(ids(moveDraftItem(s, "a", "x", "over").right)).toEqual(["a", "x"]);
  });

  it("não muta o estado original", () => {
    const s = makeSections({ center: [text("t"), column("c1", [[]])] });
    const snapshot = JSON.parse(JSON.stringify(s));
    moveDraftItem(s, "t", columnContainerId("c1", 0));
    expect(s).toEqual(snapshot);
  });
});

describe("operações em coluna", () => {
  const base = column("c1", [[text("a")], []]);

  it("insertIntoColumn aceita texto/imagem na posição pedida", () => {
    expect(insertIntoColumn(base, 0, 0, image("i")).columns[0].map((c) => c.id)).toEqual(["i", "a"]);
    expect(insertIntoColumn(base, 1, 0, text("t")).columns[1].map((c) => c.id)).toEqual(["t"]);
  });

  it("insertIntoColumn rejeita coluna, default e índice de coluna inválido", () => {
    expect(insertIntoColumn(base, 0, 0, column("c2", [[]]))).toBe(base);
    expect(insertIntoColumn(base, 0, 0, def("d", "TOC"))).toBe(base);
    expect(insertIntoColumn(base, 5, 0, text("t"))).toBe(base);
  });

  it("removeFromColumn devolve o bloco removido (ou null)", () => {
    const { column: next, removed } = removeFromColumn(base, "a");
    expect(removed?.block).toEqual({ type: "text", content: "a" });
    expect(next.columns).toEqual([[], []]);
    expect(removeFromColumn(base, "zzz")).toEqual({ column: base, removed: null });
  });

  it("updateInColumn altera só o filho alvo", () => {
    const next = updateInColumn(base, "a", { type: "text", content: "novo" });
    expect(next.columns[0][0]).toEqual({ id: "a", kind: "block", block: { type: "text", content: "novo" } });
  });
});

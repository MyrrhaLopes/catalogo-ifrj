import { describe, it, expect } from "vitest";
import {
  extractImageUrlsFromBlock,
  extractDeletedImageUrls,
} from "./useArticleEditor";
import type { ArticleBlock } from "../components/types";

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
          [
            { type: "image", content: "https://example.com/b.jpg" },
          ],
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
        {
          type: "column",
          columns: [[{ type: "image", content: "https://example.com/2.jpg" }]],
        },
      ];
      expect(extractDeletedImageUrls(deletedBlocks)).toEqual([
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ]);
    });
  });
});

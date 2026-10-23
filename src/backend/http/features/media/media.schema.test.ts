import { describe, it, expect } from "vitest";
import {
  MAX_UPLOAD_BYTES,
  mediaKeyParamsSchema,
  uploadedFileSchema,
  uploadImageFieldsSchema,
} from "./media.schema";

describe("uploadImageFieldsSchema", () => {
  it("converte speciesId string do multipart em número e aplica type 'online' por padrão", () => {
    expect(uploadImageFieldsSchema.parse({ speciesId: "7" })).toEqual({ speciesId: 7, type: "online" });
  });

  it("aceita foto do acervo vinculada a espécime", () => {
    const result = uploadImageFieldsSchema.parse({ speciesId: "3", type: "acervo", specimenId: "12" });
    expect(result).toEqual({ speciesId: 3, type: "acervo", specimenId: 12 });
  });

  it("transforma strings vazias em undefined e remove espaços", () => {
    const result = uploadImageFieldsSchema.parse({
      speciesId: "1",
      alt: "  Abelha  ",
      source: "",
      credit: "   ",
      specimenId: "",
    });
    expect(result).toEqual({ speciesId: 1, type: "online", alt: "Abelha" });
  });

  it.each([undefined, "", "abc", "0", "-1", "1.5"])("rejeita speciesId %j", (speciesId) => {
    expect(() => uploadImageFieldsSchema.parse({ speciesId })).toThrow();
  });

  it("rejeita type fora do enum", () => {
    expect(() => uploadImageFieldsSchema.parse({ speciesId: "1", type: "campus" })).toThrow();
  });

  it("rejeita specimenId inválido", () => {
    expect(() =>
      uploadImageFieldsSchema.parse({ speciesId: "1", type: "acervo", specimenId: "x" }),
    ).toThrow();
  });

  it("rejeita espécime vinculado a imagem online", () => {
    const result = uploadImageFieldsSchema.safeParse({ speciesId: "1", type: "online", specimenId: "2" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["specimenId"]);
  });

  it("rejeita texto com mais de 500 caracteres", () => {
    expect(() => uploadImageFieldsSchema.parse({ speciesId: "1", alt: "a".repeat(501) })).toThrow();
  });
});

describe("uploadedFileSchema", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"])(
    "aceita %s",
    (mimetype) => {
      expect(uploadedFileSchema.parse({ mimetype, size: 1024 })).toEqual({ mimetype, size: 1024 });
    },
  );

  it.each(["image/heic", "image/svg+xml", "application/pdf", "text/html", ""])(
    "rejeita mimetype %j",
    (mimetype) => {
      expect(() => uploadedFileSchema.parse({ mimetype, size: 1024 })).toThrow();
    },
  );

  it("aceita arquivo exatamente no limite", () => {
    expect(() => uploadedFileSchema.parse({ mimetype: "image/png", size: MAX_UPLOAD_BYTES })).not.toThrow();
  });

  it.each([0, -1, MAX_UPLOAD_BYTES + 1])("rejeita tamanho %d", (size) => {
    expect(() => uploadedFileSchema.parse({ mimetype: "image/png", size })).toThrow();
  });
});

describe("mediaKeyParamsSchema", () => {
  const file = "123e4567-e89b-12d3-a456-426614174000.jpg";

  it("aceita chave gerada pelo serviço", () => {
    expect(mediaKeyParamsSchema.parse({ speciesId: "4", file })).toEqual({ speciesId: 4, file });
  });

  it.each([
    "../segredo.jpg",
    "123e4567-e89b-12d3-a456-426614174000.exe",
    "123e4567-e89b-12d3-a456-426614174000.jpg.html",
    "nome.jpg",
    "",
  ])("rejeita arquivo %j", (badFile) => {
    expect(() => mediaKeyParamsSchema.parse({ speciesId: "4", file: badFile })).toThrow();
  });

  it("rejeita speciesId não numérico", () => {
    expect(() => mediaKeyParamsSchema.parse({ speciesId: "abc", file })).toThrow();
  });
});

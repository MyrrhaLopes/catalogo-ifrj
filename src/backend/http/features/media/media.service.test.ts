import { vi, describe, it, expect } from "vitest";
import { buildObjectKey, keyFromMediaUrl, mediaUrlForKey } from "./media.service";
import { mediaKeyParamsSchema } from "./media.schema";

// O módulo importa `db` no topo — mock evita tentativa de conexão ao banco
vi.mock("@/backend/db/drizzle", () => ({ db: {} }));

describe("buildObjectKey", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ] as const)("gera chave species/<id>/<uuid>.%s para %s", (mimetype, ext) => {
    expect(buildObjectKey(9, mimetype)).toMatch(new RegExp(`^species/9/[0-9a-f-]{36}\\.${ext}$`));
  });

  it("gera chaves únicas", () => {
    expect(buildObjectKey(1, "image/png")).not.toBe(buildObjectKey(1, "image/png"));
  });

  it("gera chave aceita pela rota de leitura", () => {
    const [, speciesId, file] = buildObjectKey(5, "image/gif").split("/");
    expect(() => mediaKeyParamsSchema.parse({ speciesId, file })).not.toThrow();
  });
});

describe("mediaUrlForKey / keyFromMediaUrl", () => {
  it("faz ida e volta entre chave e URL", () => {
    const key = "species/1/abc.jpg";
    expect(mediaUrlForKey(key)).toBe("/api/v1/media/species/1/abc.jpg");
    expect(keyFromMediaUrl(mediaUrlForKey(key))).toBe(key);
  });

  it.each(["https://commons.wikimedia.org/x.jpg", "/api/v1/images/1", ""])(
    "retorna null para URL externa %j",
    (url) => {
      expect(keyFromMediaUrl(url)).toBeNull();
    },
  );
});

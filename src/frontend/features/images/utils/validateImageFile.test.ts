import { describe, it, expect } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/backend/http/features/media/media.schema";
import { validateImageFile } from "./validateImageFile";

describe("validateImageFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"])(
    "aceita %s",
    (type) => {
      expect(validateImageFile({ type, size: 2048 })).toEqual({ ok: true });
    },
  );

  it.each(["image/heic", "application/pdf", "", "toString", "constructor"])(
    "rejeita tipo %j",
    (type) => {
      const result = validateImageFile({ type, size: 2048 });
      expect(result.ok).toBe(false);
      expect(!result.ok && result.error).toMatch(/Formato não suportado/);
    },
  );

  it("rejeita arquivo vazio", () => {
    expect(validateImageFile({ type: "image/png", size: 0 })).toEqual({
      ok: false,
      error: "O arquivo está vazio.",
    });
  });

  it("aceita arquivo no limite e rejeita acima dele", () => {
    expect(validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES }).ok).toBe(true);
    expect(validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 })).toEqual({
      ok: false,
      error: "A imagem deve ter no máximo 10 MB.",
    });
  });
});

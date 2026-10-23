import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/backend/http/features/media/media.schema";

export type ImageFileValidation = { ok: true } | { ok: false; error: string };

/** Mesmas regras do backend, para avisar o usuário antes do envio. */
export function validateImageFile(file: Pick<File, "type" | "size">): ImageFileValidation {
  if (!Object.hasOwn(ALLOWED_IMAGE_MIME_TYPES, file.type)) {
    return { ok: false, error: "Formato não suportado. Use JPG, PNG, WEBP, GIF ou AVIF." };
  }
  if (file.size <= 0) return { ok: false, error: "O arquivo está vazio." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "A imagem deve ter no máximo 10 MB." };
  return { ok: true };
}

import { z } from "zod";

// Compartilhado com o frontend (validação antes do envio).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;
export type AllowedImageMimeType = keyof typeof ALLOWED_IMAGE_MIME_TYPES;

const ALLOWED_EXTENSIONS = Object.values(ALLOWED_IMAGE_MIME_TYPES).join("|");

// Prefixo das URLs salvas no banco para imagens hospedadas no bucket.
export const MEDIA_URL_PREFIX = "/api/v1/media/";

// Campos de texto do multipart chegam como string; "" vira undefined.
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().max(500).optional(),
);

const optionalPositiveInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().positive().optional(),
);

export const uploadImageFieldsSchema = z
  .object({
    speciesId: z.coerce.number().int().positive(),
    type: z.enum(["online", "acervo"]).default("online"),
    alt: optionalText,
    source: optionalText,
    credit: optionalText,
    specimenId: optionalPositiveInt,
  })
  .refine((data) => data.type === "acervo" || data.specimenId === undefined, {
    message: "Apenas fotos do acervo podem ser vinculadas a um espécime",
    path: ["specimenId"],
  });
export type UploadImageFields = z.infer<typeof uploadImageFieldsSchema>;

export const uploadedFileSchema = z.object({
  mimetype: z.enum(
    Object.keys(ALLOWED_IMAGE_MIME_TYPES) as [AllowedImageMimeType, ...AllowedImageMimeType[]],
    { error: "Formato de imagem não suportado (use JPG, PNG, WEBP, GIF ou AVIF)" },
  ),
  size: z
    .number()
    .int()
    .positive({ error: "Arquivo vazio" })
    .max(MAX_UPLOAD_BYTES, { error: "Imagem maior que 10 MB" }),
});

// Chave do objeto no bucket: species/<id>/<uuid>.<ext>
export const mediaKeyParamsSchema = z.object({
  speciesId: z.coerce.number().int().positive(),
  file: z
    .string()
    .regex(new RegExp(`^[0-9a-f-]{36}\\.(${ALLOWED_EXTENSIONS})$`), "Arquivo inválido"),
});

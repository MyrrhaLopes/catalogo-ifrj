import { randomUUID } from "crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { db } from "@/backend/db/drizzle";
import { speciesTable } from "@/backend/db/schema";
import { IMAGES_SERVICE } from "../images/images.service";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_URL_PREFIX,
  type AllowedImageMimeType,
  type UploadImageFields,
} from "./media.schema";

// Validade da URL pré-assinada entregue pelo redirect de GET /media.
export const PRESIGNED_URL_TTL_SECONDS = 60 * 60;

type StorageConfig = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

function readStorageConfig(): StorageConfig | null {
  const { S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;
  return {
    bucket: S3_BUCKET,
    endpoint: S3_ENDPOINT,
    region: S3_REGION || "auto",
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

let storage: { client: S3Client; bucket: string } | null = null;

function getStorage() {
  if (storage) return storage;
  const config = readStorageConfig();
  if (!config) return null;
  storage = {
    bucket: config.bucket,
    client: new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      // Checksums automáticos do SDK v3 não são aceitos por todo provedor compatível com S3.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    }),
  };
  return storage;
}

export function buildObjectKey(speciesId: number, mimetype: AllowedImageMimeType): string {
  return `species/${speciesId}/${randomUUID()}.${ALLOWED_IMAGE_MIME_TYPES[mimetype]}`;
}

export function mediaUrlForKey(key: string): string {
  return `${MEDIA_URL_PREFIX}${key}`;
}

/** Devolve a chave do bucket se a URL apontar para uma imagem hospedada nele. */
export function keyFromMediaUrl(url: string): string | null {
  return url.startsWith(MEDIA_URL_PREFIX) ? url.slice(MEDIA_URL_PREFIX.length) : null;
}

export const MEDIA_SERVICE = {
  isConfigured: () => getStorage() !== null,

  /** Envia a imagem ao bucket e registra na tabela images. null = espécie inexistente. */
  uploadSpeciesImage: async (
    file: { buffer: Buffer; mimetype: AllowedImageMimeType },
    fields: UploadImageFields,
  ) => {
    const s = getStorage();
    if (!s) throw new Error("armazenamento de mídia não configurado");

    const [species] = await db
      .select({ id: speciesTable.id })
      .from(speciesTable)
      .where(eq(speciesTable.id, fields.speciesId));
    if (!species) return null;

    const key = buildObjectKey(fields.speciesId, file.mimetype);
    await s.client.send(
      new PutObjectCommand({
        Bucket: s.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    try {
      return await IMAGES_SERVICE.create({ ...fields, url: mediaUrlForKey(key) });
    } catch (err) {
      // Não deixa objeto órfão no bucket se o registro no banco falhar.
      await s.client.send(new DeleteObjectCommand({ Bucket: s.bucket, Key: key })).catch(() => {});
      throw err;
    }
  },

  getPresignedUrl: async (key: string) => {
    const s = getStorage();
    if (!s) return null;
    return getSignedUrl(s.client, new GetObjectCommand({ Bucket: s.bucket, Key: key }), {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });
  },

  /** Remove do bucket o objeto de uma imagem hospedada nele (no-op para URLs externas). */
  deleteByImageUrl: async (url: string) => {
    const key = keyFromMediaUrl(url);
    const s = getStorage();
    if (!key || !s) return;
    await s.client.send(new DeleteObjectCommand({ Bucket: s.bucket, Key: key }));
  },
};

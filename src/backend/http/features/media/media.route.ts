import { Router } from "express";
import multer from "multer";
import { MEDIA_SERVICE, PRESIGNED_URL_TTL_SECONDS } from "./media.service";
import {
  MAX_UPLOAD_BYTES,
  mediaKeyParamsSchema,
  uploadedFileSchema,
  uploadImageFieldsSchema,
} from "./media.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

const STORAGE_UNAVAILABLE = { message: "armazenamento de mídia não configurado" };

mediaRouter.post("/media", authorizeUser, upload.single("file"), async (req, res, next) => {
  try {
    if (!MEDIA_SERVICE.isConfigured()) return res.status(503).json(STORAGE_UNAVAILABLE);
    if (!req.file) return res.status(400).json({ message: "nenhum arquivo enviado" });
    const { mimetype } = uploadedFileSchema.parse(req.file);
    const fields = uploadImageFieldsSchema.parse(req.body);
    const image = await MEDIA_SERVICE.uploadSpeciesImage({ buffer: req.file.buffer, mimetype }, fields);
    if (!image) return res.status(404).json({ message: "espécie não encontrada" });
    return res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
});

mediaRouter.get("/media/species/:speciesId/:file", async (req, res, next) => {
  try {
    const { speciesId, file } = mediaKeyParamsSchema.parse(req.params);
    const url = await MEDIA_SERVICE.getPresignedUrl(`species/${speciesId}/${file}`);
    if (!url) return res.status(503).json(STORAGE_UNAVAILABLE);
    // Cache do redirect expira antes da URL pré-assinada.
    res.set("Cache-Control", `private, max-age=${PRESIGNED_URL_TTL_SECONDS - 600}`);
    return res.redirect(302, url);
  } catch (err) {
    next(err);
  }
});

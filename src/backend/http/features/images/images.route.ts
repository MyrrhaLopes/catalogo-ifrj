import { Router } from "express";
import { IMAGES_SERVICE } from "./images.service";
import {
  imageIdParamSchema,
  speciesIdQuerySchema,
  createImageSchema,
  updateImageSchema,
} from "./images.schema";
import { authorizeUser } from "../../middleware/authorizeUser";
import { MEDIA_SERVICE } from "../media/media.service";

export const imagesRouter = Router();

imagesRouter.get("/images", async (req, res, next) => {
  try {
    const { speciesId, page, pageSize, q } = speciesIdQuerySchema.parse(req.query);

    if (speciesId !== undefined) {
      const images = await IMAGES_SERVICE.getBySpecies(speciesId);
      return res.status(200).json({ images });
    }

    if (page !== undefined) {
      const result = await IMAGES_SERVICE.getAllPaginated({ page, pageSize: pageSize ?? 20, q });
      return res.status(200).json(result);
    }

    const images = await IMAGES_SERVICE.getAll();
    return res.status(200).json({ images });
  } catch (err) {
    next(err);
  }
});

imagesRouter.post("/images", authorizeUser, async (req, res, next) => {
  try {
    const data = createImageSchema.parse(req.body);
    const image = await IMAGES_SERVICE.create(data);
    return res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
});

imagesRouter.put("/images/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = imageIdParamSchema.parse(req.params);
    const data = updateImageSchema.parse(req.body);
    const image = await IMAGES_SERVICE.update(id, data);
    if (!image) return res.status(404).json({ message: "imagem não encontrada" });
    return res.status(200).json({ image });
  } catch (err) {
    next(err);
  }
});

imagesRouter.delete("/images/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = imageIdParamSchema.parse(req.params);
    const deleted = await IMAGES_SERVICE.delete(id);
    if (deleted) {
      // Best-effort: falha no bucket não deve impedir a exclusão do registro.
      await MEDIA_SERVICE.deleteByImageUrl(deleted.url).catch((err) => console.log(err));
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

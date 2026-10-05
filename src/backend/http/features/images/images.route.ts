import { Router } from "express";
import { IMAGES_SERVICE } from "./images.service";
import {
  imageIdParamSchema,
  speciesIdQuerySchema,
  createImageSchema,
  updateImageSchema,
} from "./images.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const imagesRouter = Router();

imagesRouter.get("/images", async (req, res, next) => {
  try {
    const { speciesId } = speciesIdQuerySchema.parse(req.query);
    const images = speciesId
      ? await IMAGES_SERVICE.getBySpecies(speciesId)
      : await IMAGES_SERVICE.getAll();
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
    await IMAGES_SERVICE.delete(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

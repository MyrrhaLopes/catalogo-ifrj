import { Router } from "express";
import { GALLERY_SERVICE } from "./gallery.service";

export const galleryRouter = Router();

galleryRouter.get("/gallery", async (_req, res, next) => {
  try {
    const images = await GALLERY_SERVICE.getGallery();
    return res.status(200).json({ images });
  } catch (err) {
    next(err);
  }
});

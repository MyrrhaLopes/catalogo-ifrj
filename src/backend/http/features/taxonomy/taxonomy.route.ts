import { Router } from "express";
import { TAXONOMY_SERVICE } from "./taxonomy.service";

export const taxonomyRouter = Router();

taxonomyRouter.get("/taxonomy/", async (_req, res, next) => {
  try {
    const nodes = await TAXONOMY_SERVICE.getAllNodes();
    return res.status(200).json({ nodes });
  } catch (err) {
    next(err);
  }
});

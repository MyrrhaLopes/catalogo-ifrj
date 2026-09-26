import { Router } from "express";
import { SOURCES_SERVICE } from "./sources.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import { createSourceSchema } from "./sources.schema";

export const sourcesRouter = Router();

sourcesRouter.get("/sources", async (_req, res, next) => {
  try {
    const sources = await SOURCES_SERVICE.listAll();
    return res.status(200).json({ sources });
  } catch (err) {
    next(err);
  }
});

sourcesRouter.post("/sources", authorizeUser, async (req, res, next) => {
  try {
    const { url } = createSourceSchema.parse(req.body);
    const source = await SOURCES_SERVICE.upsertByUrl(url);
    return res.status(200).json({ source });
  } catch (err) {
    next(err);
  }
});

import { Router } from "express";
import { z } from "zod";
import { ARTICLE_SERVICE } from "./article.service";
import { articleContentSchema } from "./article.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const articleRouter = Router();

const speciesIdParam = z.object({ speciesId: z.coerce.number().int().positive() });
const articleIdParam = z.object({ articleId: z.coerce.number().int().positive() });

articleRouter.get("/species/:speciesId/article", async (req, res, next) => {
  try {
    const { speciesId } = speciesIdParam.parse(req.params);
    const { article, images } = await ARTICLE_SERVICE.getBySpecies(speciesId);
    if (!article) return res.status(404).json({ message: "artigo não encontrado" });
    return res.status(200).json({ article, images });
  } catch (err) {
    next(err);
  }
});

articleRouter.post("/species/:speciesId/article", authorizeUser, async (req, res, next) => {
  try {
    const { speciesId } = speciesIdParam.parse(req.params);
    const content = articleContentSchema.parse(req.body);
    const article = await ARTICLE_SERVICE.create(speciesId, content);
    return res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
});

articleRouter.put("/articles/:articleId", authorizeUser, async (req, res, next) => {
  try {
    const { articleId } = articleIdParam.parse(req.params);
    const content = articleContentSchema.parse(req.body);
    const article = await ARTICLE_SERVICE.update(articleId, content, req.user!.id);
    if (!article) return res.status(404).json({ message: "artigo não encontrado" });
    return res.status(200).json({ article });
  } catch (err) {
    next(err);
  }
});

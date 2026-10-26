import { Router } from "express";
import { z } from "zod";
import { ARTICLE_SERVICE } from "./article.service";
import {
  articleContent,
  speciesIdQuerySchema,
  articleIdParamSchema,
  createArticleBodySchema,
} from "./article.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const articleRouter = Router();

function sendArticleResult(
  res: import("express").Response,
  result: Awaited<ReturnType<typeof ARTICLE_SERVICE.getById>>,
) {
  if (!result.article) {
    return res.status(404).json({ message: "artigo não encontrado" });
  }
  return res.status(200).json(result);
}

articleRouter.get("/articles/", async (req, res, next) => {
  try {
    const { speciesId } = speciesIdQuerySchema.parse(req.query);
    return sendArticleResult(res, await ARTICLE_SERVICE.getBySpecies(speciesId));
  } catch (err) {
    next(err);
  }
});

articleRouter.get("/articles/:articleId", async (req, res, next) => {
  try {
    const { articleId } = articleIdParamSchema.parse(req.params);
    return sendArticleResult(res, await ARTICLE_SERVICE.getById(articleId));
  } catch (err) {
    next(err);
  }
});

articleRouter.post("/articles/", authorizeUser, async (req, res, next) => {
  try {
    const { speciesId } = createArticleBodySchema.parse(req.body);
    const content = articleContent.parse(req.body);
    const deletedImageUrls = z.array(z.string()).optional().parse(req.body.deletedImageUrls) ?? [];
    const article = await ARTICLE_SERVICE.create(speciesId, content, deletedImageUrls);
    return res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
});

articleRouter.put(
  "/articles/:articleId",
  authorizeUser,
  async (req, res, next) => {
    try {
      const { articleId } = articleIdParamSchema.parse(req.params);
      const content = articleContent.parse(req.body);
      const deletedImageUrls = z.array(z.string()).optional().parse(req.body.deletedImageUrls) ?? [];
      const article = await ARTICLE_SERVICE.update(
        articleId,
        content,
        req.user!.id,
        deletedImageUrls,
      );
      if (!article)
        return res.status(404).json({ message: "artigo não encontrado" });
      return res.status(200).json({ article });
    } catch (err) {
      next(err);
    }
  },
);

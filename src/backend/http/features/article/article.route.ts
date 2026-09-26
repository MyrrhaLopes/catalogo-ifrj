import { Router } from "express";
import { ARTICLE_SERVICE } from "./article.service";
import {
  articleContent,
  speciesIdQuerySchema,
  articleIdParamSchema,
  createArticleBodySchema,
} from "./article.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const articleRouter = Router();

articleRouter.get("/articles/", async (req, res, next) => {
  try {
    const { speciesId } = speciesIdQuerySchema.parse(req.query);
    const { article, images, sources } = await ARTICLE_SERVICE.getBySpecies(speciesId);
    if (!article)
      return res.status(404).json({ message: "artigo não encontrado" });
    return res.status(200).json({ article, images, sources });
  } catch (err) {
    next(err);
  }
});

articleRouter.get("/articles/:articleId", async (req, res, next) => {
  try {
    const { articleId } = articleIdParamSchema.parse(req.params);
    const { article, images, sources } = await ARTICLE_SERVICE.getById(articleId);
    if (!article)
      return res.status(404).json({ message: "artigo não encontrado" });
    return res.status(200).json({ article, images, sources });
  } catch (err) {
    next(err);
  }
});

articleRouter.post("/articles/", authorizeUser, async (req, res, next) => {
  try {
    const { speciesId } = createArticleBodySchema.parse(req.body);
    const content = articleContent.parse(req.body);
    const article = await ARTICLE_SERVICE.create(speciesId, content);
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
      const article = await ARTICLE_SERVICE.update(
        articleId,
        content,
        req.user!.id,
      );
      if (!article)
        return res.status(404).json({ message: "artigo não encontrado" });
      return res.status(200).json({ article });
    } catch (err) {
      next(err);
    }
  },
);

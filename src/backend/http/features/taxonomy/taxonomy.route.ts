import { Router } from "express";
import { TAXONOMY_SERVICE } from "./taxonomy.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import { createTaxonomyNodeSchema, updateTaxonomyNodeSchema } from "./taxonomy.schema";
import { idParamSchema } from "../species/species.schema";

export const taxonomyRouter = Router();

taxonomyRouter.get("/taxonomy/", async (_req, res, next) => {
  try {
    const nodes = await TAXONOMY_SERVICE.getAllNodes();
    return res.status(200).json({ nodes });
  } catch (err) {
    next(err);
  }
});

taxonomyRouter.post("/taxonomy/", authorizeUser, async (req, res, next) => {
  try {
    const { label, labelValue, parentId } = createTaxonomyNodeSchema.parse(req.body);
    const node = await TAXONOMY_SERVICE.createNode(label, labelValue, parentId, req.user!.id);
    return res.status(201).json({ node });
  } catch (err) {
    next(err);
  }
});

taxonomyRouter.patch("/taxonomy/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { parentId } = updateTaxonomyNodeSchema.parse(req.body);
    const node = await TAXONOMY_SERVICE.updateNodeParent(id, parentId);
    if (!node) return res.status(404).json({ message: "Nó taxonômico não encontrado" });
    return res.status(200).json({ node });
  } catch (err) {
    next(err);
  }
});

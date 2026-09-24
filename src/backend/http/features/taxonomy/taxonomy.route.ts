import { Router } from "express";
import { TAXONOMY_SERVICE } from "./taxonomy.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import { createTaxonomyNodeSchema, updateTaxonomyNodeSchema, updateTaxonomyNodeLabelSchema } from "./taxonomy.schema";
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

taxonomyRouter.get("/taxonomy/:id/affected-species", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const species = await TAXONOMY_SERVICE.getAffectedSpecies(id);
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

taxonomyRouter.patch("/taxonomy/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { parentId } = updateTaxonomyNodeSchema.parse(req.body);
    const hasCycle = await TAXONOMY_SERVICE.isDescendantOrSelf(id, parentId);
    if (hasCycle) {
      return res.status(409).json({ message: "Operação criaria um ciclo na árvore taxonômica" });
    }
    const node = await TAXONOMY_SERVICE.updateNodeParent(id, parentId);
    if (!node) return res.status(404).json({ message: "Nó taxonômico não encontrado" });
    return res.status(200).json({ node });
  } catch (err) {
    next(err);
  }
});

taxonomyRouter.put("/taxonomy/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { label, labelValue } = updateTaxonomyNodeLabelSchema.parse(req.body);
    const node = await TAXONOMY_SERVICE.updateNodeLabel(id, label, labelValue);
    if (!node) return res.status(404).json({ message: "Nó taxonômico não encontrado" });
    return res.status(200).json({ node });
  } catch (err) {
    next(err);
  }
});

taxonomyRouter.delete("/taxonomy/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await TAXONOMY_SERVICE.deleteNode(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

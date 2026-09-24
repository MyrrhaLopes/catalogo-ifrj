import { Router } from "express";
import { ATTRIBUTE_TEMPLATES_SERVICE } from "./attribute_templates.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import {
  createAttributeTemplateSchema,
  updateAttributeTemplateSchema,
  idParamSchema,
} from "./attribute_templates.schema";

export const attributeTemplatesRouter = Router();

attributeTemplatesRouter.get("/attribute-templates", async (_req, res, next) => {
  try {
    const templates = await ATTRIBUTE_TEMPLATES_SERVICE.listAll();
    return res.status(200).json({ templates });
  } catch (err) {
    next(err);
  }
});

attributeTemplatesRouter.get("/attribute-templates/units", async (_req, res, next) => {
  try {
    const units = await ATTRIBUTE_TEMPLATES_SERVICE.listDistinctUnits();
    return res.status(200).json({ units });
  } catch (err) {
    next(err);
  }
});

attributeTemplatesRouter.post("/attribute-templates", authorizeUser, async (req, res, next) => {
  try {
    const { label, unit } = createAttributeTemplateSchema.parse(req.body);
    const template = await ATTRIBUTE_TEMPLATES_SERVICE.create(label, unit);
    return res.status(201).json({ template });
  } catch (err) {
    next(err);
  }
});

attributeTemplatesRouter.patch("/attribute-templates/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const patch = updateAttributeTemplateSchema.parse(req.body);
    const template = await ATTRIBUTE_TEMPLATES_SERVICE.update(id, patch);
    if (!template) return res.status(404).json({ message: "Template não encontrado" });
    return res.status(200).json({ template });
  } catch (err) {
    next(err);
  }
});

attributeTemplatesRouter.delete("/attribute-templates/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const result = await ATTRIBUTE_TEMPLATES_SERVICE.delete(id);
    if (result === "not_found") return res.status(404).json({ message: "Template não encontrado" });
    if (result === "in_use") return res.status(409).json({ message: "Template está em uso por uma ou mais espécies" });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

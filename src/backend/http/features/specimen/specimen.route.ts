import { Router } from "express";
import { SPECIMEN_SERVICE } from "./specimen.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import {
  idParamSchema,
  specimenInsertSchema,
  specimenUpdateSchema,
  specimenSearchQuerySchema,
} from "./specimen.schema";

export const specimenRouter = Router();

specimenRouter.get("/specimens/", async (req, res, next) => {
  try {
    const { q, page, pageSize, exposicao } = specimenSearchQuerySchema.parse(req.query);

    if (page !== undefined) {
      const result = await SPECIMEN_SERVICE.listSpecimensPaginated({
        q,
        page,
        pageSize: pageSize ?? 20,
        exposicao,
      });
      return res.status(200).json(result);
    }

    if (q || exposicao?.length) {
      const specimens = await SPECIMEN_SERVICE.searchSpecimens({ q, exposicao });
      return res.status(200).json({ specimens, total: specimens.length });
    }
    const specimens = await SPECIMEN_SERVICE.listSpecimens();
    return res.status(200).json({ specimens, total: specimens.length });
  } catch (err) {
    next(err);
  }
});

function sendSpecimenOr404(res: import("express").Response, specimen: unknown) {
  if (!specimen) return res.status(404).json({ message: "espécime não encontrado" });
  return res.status(200).json({ specimen });
}

specimenRouter.get("/specimens/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    return sendSpecimenOr404(res, await SPECIMEN_SERVICE.getSpecimenById(id));
  } catch (err) {
    next(err);
  }
});

specimenRouter.post("/specimens/", authorizeUser, async (req, res, next) => {
  try {
    const { code, exposicao, lot, shelf } = specimenInsertSchema.parse(req.body);
    const specimen = await SPECIMEN_SERVICE.registerSpecimen({
      code,
      exposicao,
      lot: lot ?? null,
      shelf: shelf ?? null,
      createdBy: req.user!.id,
    });
    return res.status(201).json({ specimen });
  } catch (err) {
    next(err);
  }
});

specimenRouter.patch("/specimens/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const patch = specimenUpdateSchema.parse(req.body);
    return sendSpecimenOr404(res, await SPECIMEN_SERVICE.updateSpecimen(id, patch));
  } catch (err) {
    next(err);
  }
});

specimenRouter.delete("/specimens/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await SPECIMEN_SERVICE.deleteSpecimen(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

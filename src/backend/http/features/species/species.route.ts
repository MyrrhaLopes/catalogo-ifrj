import { Router } from "express";
import { z } from "zod";
import { SPECIES_SERVICE } from "./species.service";
import { authorizeUser } from "../../middleware/authorizeUser";

export const speciesRouter = Router();

const createSpeciesSchema = z.object({
  speciesRoot: z.number().int().positive(),
  specimen: z.number().int().positive().optional(),
});

const addPopularNameSchema = z.object({
  name: z.string().min(1),
  origin: z.string().optional(),
});

speciesRouter.post("/species/", authorizeUser, async (req, res, next) => {
  try {
    const { speciesRoot, specimen } = createSpeciesSchema.parse(req.body);
    const species = await SPECIES_SERVICE.registerSpecie({
      speciesRoot,
      specimen,
      createdBy: req.user!.id,
    });
    return res.status(201).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/", async (req, res, next) => {
  try {
    const species = await SPECIES_SERVICE.getSpecies();
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "id inválido" });
    const species = await SPECIES_SERVICE.getSpecieById(id);
    if (!species) return res.status(404).json({ message: "espécie não encontrada" });
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.delete("/species/:id", authorizeUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "id inválido" });
    await SPECIES_SERVICE.deleteSpecie(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

speciesRouter.post("/species/:id/popular-names", authorizeUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "id inválido" });
    const { name, origin } = addPopularNameSchema.parse(req.body);
    const popularName = await SPECIES_SERVICE.addPopularName(id, name, origin);
    return res.status(201).json({ popularName });
  } catch (err) {
    next(err);
  }
});

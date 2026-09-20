import { Router } from "express";
import { SPECIES_SERVICE } from "./species.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import { idParamSchema, createSpeciesSchema, addPopularNameSchema } from "./species.schema";

export const speciesRouter = Router();

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

speciesRouter.get("/species/", async (_req, res, next) => {
  try {
    const species = await SPECIES_SERVICE.getSpecies();
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const species = await SPECIES_SERVICE.getSpecieById(id);
    if (!species) return res.status(404).json({ message: "espécie não encontrada" });
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.delete("/species/:id", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await SPECIES_SERVICE.deleteSpecie(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/:id/details", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const details = await SPECIES_SERVICE.getSpeciesDetails(id);
    if (!details) return res.status(404).json({ message: "espécie não encontrada" });
    return res.status(200).json({ details });
  } catch (err) {
    next(err);
  }
});

speciesRouter.post("/species/:id/popular-names", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { name, origin } = addPopularNameSchema.parse(req.body);
    const popularName = await SPECIES_SERVICE.addPopularName(id, name, origin);
    return res.status(201).json({ popularName });
  } catch (err) {
    next(err);
  }
});

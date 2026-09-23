import { Router } from "express";
import { SPECIES_SERVICE } from "./species.service";
import { authorizeUser } from "../../middleware/authorizeUser";
import {
  idParamSchema,
  createSpeciesSchema,
  addPopularNameSchema,
  speciesQuerySchema,
  speciesListQuerySchema,
  setSpeciesAttributesSchema,
} from "./species.schema";

export const speciesRouter = Router();

speciesRouter.post("/species/", authorizeUser, async (req, res, next) => {
  try {
    const { speciesRoot } = createSpeciesSchema.parse(req.body);
    const species = await SPECIES_SERVICE.registerSpecie({
      speciesRoot,
      createdBy: req.user!.id,
    });
    return res.status(201).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/", async (req, res, next) => {
  try {
    const hasSearchParams =
      req.query.q !== undefined ||
      req.query.page !== undefined ||
      req.query.taxNodes !== undefined ||
      req.query.attrs !== undefined;

    if (hasSearchParams) {
      const params = speciesListQuerySchema.parse(req.query);
      const result = await SPECIES_SERVICE.searchSpecies(params);
      return res.status(200).json(result);
    }

    const species = await SPECIES_SERVICE.getSpecies();
    return res.status(200).json({ species });
  } catch (err) {
    next(err);
  }
});

speciesRouter.get("/species/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { withTaxonomy } = speciesQuerySchema.parse(req.query);
    const species = await SPECIES_SERVICE.getSpecieById(id, { withTaxonomy });
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

speciesRouter.put("/species/:id/attributes", authorizeUser, async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { attributes } = setSpeciesAttributesSchema.parse(req.body);
    await SPECIES_SERVICE.setSpeciesAttributes(id, attributes);
    return res.status(204).send();
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


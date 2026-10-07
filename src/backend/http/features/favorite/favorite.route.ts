import { Router } from "express";
import { FAVORITE_SERVICE } from "./favorite.service";
import { speciesIdParamSchema, favoriteSyncBodySchema } from "./favorite.schema";
import { authorizeUser } from "../../middleware/authorizeUser";

export const favoriteRouter = Router();

favoriteRouter.get("/favorites/", authorizeUser, async (req, res, next) => {
  try {
    const favoriteIds = await FAVORITE_SERVICE.getFavoriteIds(req.user!.id);
    return res.status(200).json({ favoriteIds });
  } catch (err) {
    next(err);
  }
});

favoriteRouter.post("/favorites/sync", authorizeUser, async (req, res, next) => {
  try {
    const { ids } = favoriteSyncBodySchema.parse(req.body);
    await FAVORITE_SERVICE.syncFavorites(req.user!.id, ids);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

favoriteRouter.post("/favorites/:speciesId", authorizeUser, async (req, res, next) => {
  try {
    const { speciesId } = speciesIdParamSchema.parse(req.params);
    const action = await FAVORITE_SERVICE.toggleFavorite(req.user!.id, speciesId);
    return res.status(200).json({ action, speciesId });
  } catch (err) {
    next(err);
  }
});

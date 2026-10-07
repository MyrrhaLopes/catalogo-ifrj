import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import { speciesViewRoute } from "./pages/SpeciesViewPage";
import { speciesSearchRoute } from "./pages/SpeciesSearchPage";
import { adminRoute } from "./pages/AdminPage";
import { loginRoute } from "./pages/LoginPage";
import { registerRoute } from "./pages/RegisterPage";
import { homeRoute } from "./pages/HomePage";
import { galleryRoute } from "./pages/GalleryPage";
import { favoritesRoute } from "./pages/FavoritesPage";
import { editUserRoute } from "./pages/EditUserPage";

const routeTree = rootRoute.addChildren([speciesSearchRoute, speciesViewRoute, adminRoute, loginRoute, registerRoute, homeRoute, galleryRoute, favoritesRoute, editUserRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

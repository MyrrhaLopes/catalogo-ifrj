import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import { speciesViewRoute } from "./pages/SpeciesViewPage";
import { speciesSearchRoute } from "./pages/SpeciesSearchPage";

const routeTree = rootRoute.addChildren([speciesSearchRoute, speciesViewRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

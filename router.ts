import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import { homeRoute } from "./pages/HomePage";
import { loginRoute } from "./pages/LoginPage";
import { registerRoute } from "./pages/RegisterPage";
import { taskRoute } from "./pages/TaskPage";

const routeTree = rootRoute.addChildren([homeRoute, loginRoute, registerRoute, taskRoute]);

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

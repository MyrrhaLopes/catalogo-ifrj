import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
  beforeLoad: () => { throw redirect({ to: "/especies/buscar", search: { searchIn: "species" } }) }
});

function HomePage() {

}

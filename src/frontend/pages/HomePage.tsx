import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import z from "zod";

const homeSearchSchema = z.object({
})
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
  beforeLoad: () => { throw redirect({ to: "/especies/buscar", search: { searchIn: "species" } }) }
});
export type HomeSearch = z.infer<typeof homeSearchSchema>;

export function HomePage() {

}

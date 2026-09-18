import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import type { UserInsert } from "@/backend/db/schema";

export type AuthContext = {
  user: UserInsert | null | undefined;
  isLoading: boolean;
};

const PUBLIC_PATHS = ["/login", "/register"];

export const rootRoute = createRootRouteWithContext<{ auth: AuthContext }>()({
  beforeLoad: ({ context, location }) => {
    if (!PUBLIC_PATHS.includes(location.pathname) && !context.auth.isLoading && context.auth.user === null) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ToastProvider } from "@/frontend/shared/context/ToastContext";

export const rootRoute = createRootRoute({
  component: () => (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  ),
});

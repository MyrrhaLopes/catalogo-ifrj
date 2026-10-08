import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/frontend/components/ui/sonner";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        toastOptions={{
          classNames: {
            error: "!bg-red-600 !text-white !border-red-600",
            success: "!bg-green-500 !text-white !border-green-500",
            warning: "!bg-yellow-400 !text-neutral-900 !border-yellow-400",
          },
        }}
      />
    </>
  ),
});

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CatalogHeader } from "@/frontend/components/CatalogHeader";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <CatalogHeader />
      {children}
    </div>
  );
}

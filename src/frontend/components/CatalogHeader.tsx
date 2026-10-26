import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { HeaderSearch } from "@/frontend/features/catalog/components/HeaderSearch";
import { UserMenu } from "@/frontend/features/catalog/components/UserMenu";
import { MobileNav } from "@/frontend/features/catalog/components/MobileNav";

type CatalogHeaderProps = {
  className?: string;
};

export function CatalogHeader({ className }: CatalogHeaderProps) {
  const { data: user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header
      className={cn(
        "flex items-center gap-3 border-b border-green-900 bg-[#2e7d32] px-4 py-2 lg:gap-6 lg:px-6 tv:px-10 tv:py-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="shrink-0 rounded-md p-1.5 text-white transition-colors hover:bg-white/10 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/logo-ifrj.png"
          alt="Instituto Federal de Educação, Ciência e Tecnologia do Rio de Janeiro"
          className="hidden h-10 w-auto lg:block tv:h-14"
        />
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-base font-bold text-white lg:hidden"
        >
          Catálogo IFRJ
        </Link>
      </div>

      <nav className="hidden flex-1 items-center gap-6 lg:flex">
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-xl font-bold text-white tv:text-2xl"
        >
          Catálogo IFRJ
        </Link>
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-sm text-white transition-colors hover:underline tv:text-base"
        >
          Espécies
        </Link>
        <Link
          to="/galeria"
          search={{ search: "", origin: "all", groupBy: "especie", taxPath: [], thumbSize: "medium" }}
          className="text-sm text-white transition-colors hover:underline tv:text-base"
        >
          Galeria
        </Link>
        {user?.isAdmin && (
          <Link
            to="/admin"
            search={{ section: "species" }}
            className="text-sm text-white transition-colors hover:underline tv:text-base"
          >
            Admin
          </Link>
        )}
      </nav>

      <div className="hidden shrink-0 lg:block">
        <HeaderSearch className="w-48 xl:w-64 tv:w-80" />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
        <UserMenu />
      </div>

      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        isAdmin={user?.isAdmin === true}
      />
    </header>
  );
}

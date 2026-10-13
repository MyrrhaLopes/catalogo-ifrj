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
        "flex items-center gap-3 border-b border-[#aaba20] bg-[#8aba6d] px-4 py-2 lg:gap-6 lg:px-6 tv:px-10 tv:py-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="shrink-0 rounded-md p-1.5 text-green-950 transition-colors hover:bg-black/5 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <IFRJLogo />
        <div className="hidden text-[10px] font-medium uppercase leading-tight text-green-950 lg:block tv:text-xs">
          <p className="font-bold">Instituto Federal</p>
          <p>de Educação, Ciência e Tecnologia</p>
          <p>Rio de Janeiro</p>
        </div>
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-base font-bold text-green-950 lg:hidden"
        >
          Catálogo IFRJ
        </Link>
      </div>

      <nav className="hidden flex-1 items-center gap-6 lg:flex">
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-xl font-bold text-green-950 tv:text-2xl"
        >
          Catálogo IFRJ
        </Link>
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-sm text-green-950 transition-colors hover:underline tv:text-base"
        >
          Espécies
        </Link>
        <Link
          to="/galeria"
          search={{ search: "", origin: "all", groupBy: "especie", taxPath: [], thumbSize: "medium" }}
          className="text-sm text-green-950 transition-colors hover:underline tv:text-base"
        >
          Galeria
        </Link>
        {user?.isAdmin && (
          <Link
            to="/admin"
            search={{ section: "species" }}
            className="text-sm text-green-950 transition-colors hover:underline tv:text-base"
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

function IFRJLogo() {
  const colors = [
    "#1a5e2a", "#2e7d32", "#1a5e2a", "#4caf50",
    "#4caf50", "#1a5e2a", "#2e7d32", "#1a5e2a",
    "#1a5e2a", "#4caf50", "#1a5e2a", "#2e7d32",
    "#2e7d32", "#1a5e2a", "#4caf50", "#1a5e2a",
  ];

  return (
    <div
      className="grid shrink-0 gap-[2px]"
      style={{ gridTemplateColumns: "repeat(4, 1fr)", width: 36, height: 36 }}
    >
      {colors.map((color, i) => (
        <div key={i} style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

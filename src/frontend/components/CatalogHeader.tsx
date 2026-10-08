import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { HeaderSearch } from "@/frontend/features/catalog/components/HeaderSearch";
import { UserMenu } from "@/frontend/features/catalog/components/UserMenu";

type CatalogHeaderProps = {
  className?: string;
};

export function CatalogHeader({ className }: CatalogHeaderProps) {
  const { data: user } = useAuth();

  return (
    <header
      className={cn(
        "flex items-center gap-6 border-b border-[#aaba20] bg-[#8aba6d] px-6 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-3 shrink-0">
        <IFRJLogo />
        <div className="text-[10px] font-medium uppercase leading-tight text-green-950">
          <p className="font-bold">Instituto Federal</p>
          <p>de Educação, Ciência e Tecnologia</p>
          <p>Rio de Janeiro</p>
        </div>
      </div>

      <nav className="flex flex-1 items-center gap-6">
        <span className="text-xl font-bold text-green-950">Catálogo IFRJ</span>
        <Link
          to="/especies/buscar"
          search={{ searchIn: "species" }}
          className="text-sm text-green-950 transition-colors hover:underline"
        >
          Espécies
        </Link>
        <Link
          to="/galeria"
          search={{ search: "", origin: "all", groupBy: "especie", taxPath: [], thumbSize: "medium" }}
          className="text-sm text-green-950 transition-colors hover:underline"
        >
          Galeria
        </Link>
        {user?.isAdmin && (
          <Link
            to="/admin"
            search={{ section: "species" }}
            className="text-sm text-green-950 transition-colors hover:underline"
          >
            Admin
          </Link>
        )}
      </nav>

      <HeaderSearch />

      <div className="shrink-0 flex items-center gap-2">
        <UserMenu />
      </div>
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

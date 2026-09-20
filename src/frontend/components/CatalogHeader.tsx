import { Search } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { cn } from "@/frontend/shared/utils";

type CatalogHeaderProps = {
  className?: string;
};

export function CatalogHeader({ className }: CatalogHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-6 border-b border-[#aaba20] bg-[#c5d831] px-6 py-2",
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
        <a
          href="/especies"
          className="text-sm text-green-950 transition-colors hover:underline"
        >
          Espécies
        </a>
      </nav>

      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar espécime"
          className="w-60 rounded-sm border-neutral-300 bg-white pl-9 text-sm focus-visible:ring-green-600"
        />
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

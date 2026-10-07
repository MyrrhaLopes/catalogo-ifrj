import { useRef, useState } from "react";
import { Search, UserCircle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/frontend/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/shared/utils";
import { searchSpecies } from "@/frontend/features/species/species.api";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { logoutUser, deleteAccount } from "@/frontend/shared/api/users";
import { router } from "@/frontend/router";

const CONFIRM_PHRASE = "Confirmo que desejo deletar minha conta";

type CatalogHeaderProps = {
  className?: string;
};

export function CatalogHeader({ className }: CatalogHeaderProps) {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: quickResults } = useQuery({
    queryKey: ["quick-search", debouncedQuery],
    queryFn: () => searchSpecies({ q: debouncedQuery, pageSize: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  function handleChange(value: string) {
    setQuery(value);
    setIsOpen(value.length >= 2);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      navigate({ to: "/especies/buscar", search: { searchIn: "species", q: query.trim() } });
    }
    if (e.key === "Escape") setIsOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  }

  function goToSpecies(id: number) {
    setIsOpen(false);
    setQuery("");
    navigate({ to: "/especies/$id", params: { id: String(id) } });
  }

  const handleLogout = async () => {
    await logoutUser();
    queryClient.setQueryData(["auth", "current_user"], null);
    await router.invalidate();
    void navigate({ to: "/login" });
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      queryClient.setQueryData(["auth", "current_user"], null);
      await router.invalidate();
      void navigate({ to: "/login" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setConfirmText("");
  };

  const species = quickResults?.species ?? [];

  return (
    <>
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

        <div ref={containerRef} className="relative shrink-0" onBlur={handleBlur}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Pesquisar espécime"
            className="w-60 rounded-sm border-neutral-300 bg-white pl-9 text-sm focus-visible:ring-green-600"
          />

          {isOpen && species.length > 0 && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-neutral-200 bg-white shadow-xl">
              {species.map((s) => {
                const leaf = s.taxonomyPath.at(-1);
                const parent = s.taxonomyPath.at(-2);
                const name =
                  leaf?.label === "Espécie" && parent
                    ? `${parent.labelValue} ${leaf.labelValue}`
                    : (leaf?.labelValue ?? "Espécie");
                const popular = s.popularNames[0]?.name;

                return (
                  <button
                    key={s.id}
                    className="flex w-full flex-col px-4 py-3 text-left hover:bg-neutral-50"
                    onMouseDown={() => goToSpecies(s.id)}
                  >
                    <span className="text-sm font-medium italic text-neutral-900">{name}</span>
                    {popular && (
                      <span className="text-xs text-neutral-500">{popular}</span>
                    )}
                  </button>
                );
              })}
              <div className="border-t border-neutral-100 px-4 py-2">
                <button
                  className="text-xs text-green-700 hover:underline"
                  onMouseDown={() => {
                    setIsOpen(false);
                    navigate({ to: "/especies/buscar", search: { searchIn: "species", q: query } });
                  }}
                >
                  Ver todos os resultados para "{query}"
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-green-950 hover:bg-green-800/10 hover:text-green-950">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/favoritos">Meus Favoritos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/editar-usuario">Editar Usuário</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
                  Sair
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  Apagar conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="border-green-800/40 bg-transparent text-green-950 hover:bg-green-800/10 hover:text-green-950">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-green-900/70 hover:bg-green-800/10 hover:text-green-950">
                <Link to="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Apagar conta</DialogTitle>
            <DialogDescription>
              Esta ação é permanente e não pode ser desfeita. Todas as suas
              tarefas serão deletadas junto com a conta.
              <br />
              <br />
              Para confirmar, digite exatamente:
              <br />
              <span className="font-medium text-foreground">
                "{CONFIRM_PHRASE}"
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => handleDialogOpenChange(false)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? "Apagando..." : "Apagar conta"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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

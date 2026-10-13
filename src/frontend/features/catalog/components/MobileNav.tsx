import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { HeaderSearch } from "./HeaderSearch";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
};

export function MobileNav({ open, onOpenChange, isAdmin }: Props) {
  function close() {
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 flex h-full w-[85%] max-w-sm flex-col gap-6 overflow-y-auto bg-white p-5 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <Dialog.Description className="sr-only">Menu de navegação do Catálogo IFRJ</Dialog.Description>
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-green-900">Catálogo IFRJ</Dialog.Title>
            <Dialog.Close
              className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <HeaderSearch className="w-full" onNavigate={close} />

          <nav className="flex flex-col gap-1 text-base font-medium text-neutral-800">
            <Link
              to="/especies/buscar"
              search={{ searchIn: "species" }}
              onClick={close}
              className="rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-100"
            >
              Espécies
            </Link>
            <Link
              to="/galeria"
              search={{ search: "", origin: "all", groupBy: "especie", taxPath: [], thumbSize: "medium" }}
              onClick={close}
              className="rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-100"
            >
              Galeria
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                search={{ section: "species" }}
                onClick={close}
                className="rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-100"
              >
                Admin
              </Link>
            )}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { createRoute } from "@tanstack/react-router";
import { useState } from "react";
import { rootRoute } from "../rootRoute";
import { CatalogHeader } from "../components/CatalogHeader";
import { Button } from "../components/ui/button";
import { cn } from "../shared/utils";
import { SpeciesTable } from "../features/admin/components/SpeciesTable";
import { UsersTable } from "../features/admin/components/UsersTable";
import { CreateSpeciesModal } from "../features/admin/components/CreateSpeciesModal";
import { TaxonomyTree } from "../features/admin/components/TaxonomyTree";
import { Plus } from "lucide-react";

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

type Section = "species" | "specimen" | "users" | "taxonomy";

const sidebarItems: { id: Section; label: string }[] = [
  { id: "species", label: "Gerenciar espécies" },
  { id: "specimen", label: "Gerenciar espécime" },
  { id: "users", label: "Gerenciar usuários" },
  { id: "taxonomy", label: "Árvore taxonômica" },
];

function AdminPage() {
  const [section, setSection] = useState<Section>("species");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <CatalogHeader />
      <div className="flex flex-1 gap-4 p-4 max-w-screen-xl mx-auto w-full">
        <aside className="w-52 shrink-0">
          <div className="border rounded-lg overflow-hidden">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted/60",
                  section === item.id
                    ? "bg-muted font-medium border-l-2 border-primary"
                    : "border-l-2 border-transparent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 border rounded-lg p-4 flex flex-col gap-4">
          {section === "species" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Espécies</h2>
                <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Criar espécie
                </Button>
              </div>
              <SpeciesTable />
              <CreateSpeciesModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
              />
            </>
          )}

          {section === "specimen" && (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Gerenciamento de espécimes em breve.
            </div>
          )}

          {section === "users" && (
            <>
              <h2 className="text-lg font-semibold">Usuários cadastrados</h2>
              <UsersTable />
            </>
          )}

          {section === "taxonomy" && (
            <>
              <h2 className="text-lg font-semibold">Árvore taxonômica</h2>
              <p className="text-sm text-muted-foreground">
                Para criar um novo nível, passe o mouse abaixo do label{" "}
                <span className="font-medium text-foreground">Árvore taxonômica</span> ou abaixo de qualquer nível existente — uma linha verde com um{" "}
                <span className="font-medium text-green-600">+</span> vai aparecer para inserir.
              </p>
              <TaxonomyTree variant="manage" />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

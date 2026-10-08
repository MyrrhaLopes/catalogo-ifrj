import { useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { z } from "zod";
import { PageShell } from "../components/layout/PageShell";
import { PageLoading } from "../components/layout/PageLoading";
import { PageError } from "../components/layout/PageError";
import { Button } from "../components/ui/button";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../shared/auth";
import { SpeciesTable } from "../features/admin/components/SpeciesTable";
import { UsersTable } from "../features/admin/components/UsersTable";
import { CreateSpeciesModal } from "../features/admin/components/CreateSpeciesModal";
import { TaxonomyTree } from "../features/admin/components/TaxonomyTree";
import { SpecimenTable } from "../features/admin/components/SpecimenTable";
import { CreateSpecimenModal } from "../features/admin/components/CreateSpecimenModal";
import { AttributeTemplatesTable } from "../features/admin/components/AttributeTemplatesTable";
import { ImagesTable } from "../features/admin/components/ImagesTable";
import { Plus } from "lucide-react";

const adminSearchSchema = z.object({
  section: z.enum(["species", "specimen", "users", "taxonomy", "attributes", "images"]).optional().default("species"),
  selectedNodeId: z.coerce.number().int().positive().optional(),
  selectedSpeciesId: z.coerce.number().int().positive().optional(),
  selectedSpecimenId: z.coerce.number().int().positive().optional(),
});

export type AdminSearch = z.infer<typeof adminSearchSchema>;

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: requireAdmin,
  validateSearch: (search: Record<string, unknown>) => adminSearchSchema.parse(search),
  component: AdminPage,
  pendingComponent: PageLoading,
  errorComponent: PageError,
});

type Section = "species" | "specimen" | "users" | "taxonomy" | "attributes" | "images";

const sidebarItems: { id: Section; label: string }[] = [
  { id: "species", label: "Gerenciar espécies" },
  { id: "specimen", label: "Gerenciar espécime" },
  { id: "attributes", label: "Gerenciar atributos" },
  { id: "images", label: "Gerenciar imagens" },
  { id: "users", label: "Gerenciar usuários" },
  { id: "taxonomy", label: "Árvore taxonômica" },
];

function AdminPage() {
  const { section, selectedNodeId, selectedSpeciesId, selectedSpecimenId } =
    adminRoute.useSearch();
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSpecimenModalOpen, setCreateSpecimenModalOpen] = useState(false);

  function setSection(s: Section) {
    void navigate({ to: "/admin", search: (prev) => ({ ...prev, section: s }) });
  }

  return (
    <PageShell>
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
              <SpeciesTable selectedSpeciesId={selectedSpeciesId} />
              <CreateSpeciesModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
              />
            </>
          )}

          {section === "specimen" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Espécimes</h2>
                <Button size="sm" onClick={() => setCreateSpecimenModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar espécime
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Na coluna <span className="font-medium text-foreground">Espécie vinculada</span>, clique na borda ao redor do código da espécie para alterar o vínculo — ou clique diretamente no código para navegar até a espécie.
              </p>
              <SpecimenTable selectedSpecimenId={selectedSpecimenId} />
              <CreateSpecimenModal
                open={createSpecimenModalOpen}
                onOpenChange={setCreateSpecimenModalOpen}
              />
            </>
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
              <TaxonomyTree variant="manage" selectedNodeId={selectedNodeId} />
            </>
          )}

          {section === "attributes" && (
            <AttributeTemplatesTable />
          )}

          {section === "images" && (
            <ImagesTable />
          )}
        </main>
      </div>
    </PageShell>
  );
}

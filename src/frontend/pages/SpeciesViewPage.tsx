import { useState, useMemo } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FlaskConical, GripVertical, Pencil } from "lucide-react";
import { rootRoute } from "../rootRoute";
import { useGetSpeciesDetails } from "../features/species/hooks/useGetSpeciesDetails";
import { CatalogHeader } from "../components/CatalogHeader";
import type { ArticleImage } from "../features/article/article.api";
import { ArticleSectionRenderer } from "../features/article/components/ArticleSectionRenderer";
import useAuth from "@/frontend/shared/hooks/useAuth";
import { Button } from "@/frontend/components/ui/button";
import { useArticleEditor, type SectionKey, type DraftSections } from "@/frontend/features/article/hooks/useArticleEditor";
import { useSaveArticle } from "@/frontend/features/article/hooks/useSaveArticle";
import { ArticleEditorHeader } from "@/frontend/features/article/components/editor/ArticleEditorHeader";
import { ArticleEditorSection } from "@/frontend/features/article/components/editor/ArticleEditorSection";
import type { SpeciesDetails } from "@/frontend/features/species/species.api";
import { computeUnifiedSources, buildSourceMaps } from "@/frontend/features/article/components/utils";

export const speciesViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/especies/$id",
  validateSearch: (search: Record<string, unknown>) =>
    z.object({ editArticle: z.boolean().optional() }).parse(search),
  component: SpeciesViewPage,
});

function SpeciesViewPage() {
  const { id } = speciesViewRoute.useParams();
  const search = speciesViewRoute.useSearch();
  const { data: species, isLoading, error } = useGetSpeciesDetails(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
          Carregando...
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
          Espécie não encontrada.
        </div>
      </div>
    );
  }

  return <SpeciesViewLoaded id={id} species={species} editArticle={search.editArticle} />;
}

type LoadedProps = {
  id: string;
  species: SpeciesDetails;
  editArticle?: boolean;
};

function SpeciesViewLoaded({ id, species, editArticle }: LoadedProps) {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true;
  const isEditMode = editArticle === true && isAdmin;
  const [isPreview, setIsPreview] = useState(false);

  const editor = useArticleEditor(Number(id), species.article);
  const saveArticle = useSaveArticle(Number(id), species.article?.id ?? null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function findContainer(itemId: string): SectionKey | null {
    if (itemId === "left" || itemId === "center" || itemId === "right") return itemId as SectionKey;
    for (const key of ["left", "center", "right"] as SectionKey[]) {
      if (editor.sections[key].some((item) => item.id === itemId)) return key;
    }
    return null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    const fromContainer = findContainer(aId);
    const toContainer = findContainer(oId);
    if (!fromContainer || !toContainer || fromContainer === toContainer) return;

    editor.setSections((prev: DraftSections) => {
      const fromItems = [...prev[fromContainer]];
      const toItems = [...prev[toContainer]];
      const fromIdx = fromItems.findIndex((i) => i.id === aId);
      if (fromIdx < 0) return prev;
      const toIdx = toItems.findIndex((i) => i.id === oId);
      const [item] = fromItems.splice(fromIdx, 1);
      const insertAt = toIdx >= 0 ? toIdx : toItems.length;
      return {
        ...prev,
        [fromContainer]: fromItems,
        [toContainer]: [...toItems.slice(0, insertAt), item, ...toItems.slice(insertAt)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    const fromContainer = findContainer(aId);
    const toContainer = findContainer(oId);
    if (!fromContainer || !toContainer || fromContainer !== toContainer) return;
    const fromIdx = editor.sections[fromContainer].findIndex((i) => i.id === aId);
    const toIdx = editor.sections[toContainer].findIndex((i) => i.id === oId);
    if (fromIdx !== toIdx) {
      editor.setSections((prev: DraftSections) => ({
        ...prev,
        [fromContainer]: arrayMove(prev[fromContainer], fromIdx, toIdx),
      }));
    }
  }

  function handleSave() {
    saveArticle.mutate(editor.toDraftContent(), {
      onSuccess: () => {
        editor.clearDraft();
        void navigate({ to: "/especies/$id", params: { id }, search: {} });
      },
    });
  }

  function handleCancel() {
    editor.clearDraft();
    void navigate({ to: "/especies/$id", params: { id }, search: {} });
  }

  const lastNode = species.taxonomyPath.at(-1);
  const secondLastNode = species.taxonomyPath.at(-2);
  const scientificName =
    lastNode?.label === "Espécie" && secondLastNode
      ? `${secondLastNode.labelValue} ${lastNode.labelValue}`
      : (lastNode?.labelValue ?? "Espécie");
  const popularName = species.popularNames[0]?.name;
  const content = species.article?.content;
  const [heroImage, ...thumbnails] = species.images;
  const draftContent = isPreview ? editor.toDraftContent() : null;

  const inlineSources = species.sources;

  const attributeSources = useMemo(
    () =>
      species.attributes
        .filter((a) => a.sourceUrl != null)
        .map((a) => ({ url: a.sourceUrl! })),
    [species.attributes],
  );

  const sourceMaps = useMemo(() => {
    if (!content) return { byId: new Map<number, number>(), byUrl: new Map<string, number>() };
    return buildSourceMaps(computeUnifiedSources(content, inlineSources, attributeSources));
  }, [content, inlineSources, attributeSources]);

  const previewSourceMaps = useMemo(() => {
    if (!draftContent) return { byId: new Map<number, number>(), byUrl: new Map<string, number>() };
    return buildSourceMaps(computeUnifiedSources(draftContent, inlineSources, attributeSources));
  }, [draftContent, inlineSources, attributeSources]);

  const activeItem = activeId
    ? (["left", "center", "right"] as SectionKey[])
      .flatMap((key) => editor.sections[key])
      .find((item) => item.id === activeId)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      {isEditMode && (
        <ArticleEditorHeader
          mode={isPreview ? "preview" : "edit"}
          isSaving={saveArticle.isPending}
          onPreview={() => setIsPreview(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onBackToEdit={() => setIsPreview(false)}
        />
      )}

      {/* Hero */}
      <section
        className={`bg-[#e8f2d0] grid h-[420px] overflow-hidden ${thumbnails.length > 0 ? "grid-cols-[1fr_1fr_160px]" : "grid-cols-[1fr_1fr]"
          }`}
      >
        <div className="flex flex-col justify-end px-12 py-10">
          <Breadcrumb nodes={species.taxonomyPath} />
          <h1 className="text-5xl font-bold italic text-neutral-900 mt-6 leading-tight">
            {scientificName}
          </h1>
          {popularName && (
            <p className="text-lg text-neutral-600 mt-1">{popularName}</p>
          )}
          {isAdmin && !isEditMode && (
            <div className="flex gap-2 mt-4 self-start">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/80 border-neutral-400 hover:bg-white hover:border-neutral-600"
                onClick={() =>
                  void navigate({
                    to: "/especies/$id",
                    params: { id },
                    search: { editArticle: true },
                  })
                }
              >
                <Pencil className="h-3 w-3 mr-1" />
                Editar Artigo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/80 border-neutral-400 hover:bg-white hover:border-neutral-600"
                onClick={() =>
                  void navigate({
                    to: "/admin",
                    search: { section: "species" as const, selectedSpeciesId: Number(id) },
                  })
                }
              >
                <FlaskConical className="h-3 w-3 mr-1" />
                Editar Espécie
              </Button>
            </div>
          )}
          {species.specimens.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
              {species.specimens.map((s, i) => (
                <span key={s.id} className="flex items-center gap-1 text-xs text-neutral-700">
                  {i > 0 && <span className="text-neutral-400">·</span>}
                  <span className="font-medium">{s.code}</span>
                  {(s.shelf != null || s.lot != null) && (
                    <span className="text-neutral-500">
                      {[
                        s.shelf != null ? `Prateleira ${s.shelf}` : null,
                        s.lot != null ? `Lote ${s.lot}` : null,
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <HeroImage image={heroImage} alt={scientificName} />

        {thumbnails.length > 0 && (
          <div className="flex flex-col grid-cols-[1fr]">
            {thumbnails.slice(0, 4).map((img) => (
              <ThumbnailImage key={img.id} image={img} alt={img.alt ?? scientificName} />
            ))}
          </div>
        )}
      </section>

      {/* Content — view mode */}
      {!isEditMode && content && (
        <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
          {content.sections.left && (
            <aside className="w-44 shrink-0 sticky top-6 self-start">
              <ArticleSectionRenderer sectionKey="left" content={content} species={species} sourceMaps={sourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </aside>
          )}
          {content.sections.center && (
            <article className="flex-1 min-w-0">
              <ArticleSectionRenderer sectionKey="center" content={content} species={species} sourceMaps={sourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </article>
          )}
          {content.sections.right && (
            <aside className="w-52 shrink-0 sticky top-6 self-start">
              <ArticleSectionRenderer sectionKey="right" content={content} species={species} sourceMaps={sourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </aside>
          )}
        </div>
      )}

      {/* Content — edit preview mode */}
      {isEditMode && isPreview && draftContent && (
        <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
          {draftContent.sections.left && draftContent.sections.left.length > 0 && (
            <aside className="w-44 shrink-0 sticky top-6 self-start">
              <ArticleSectionRenderer sectionKey="left" content={draftContent} species={species} sourceMaps={previewSourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </aside>
          )}
          {draftContent.sections.center && draftContent.sections.center.length > 0 && (
            <article className="flex-1 min-w-0">
              <ArticleSectionRenderer sectionKey="center" content={draftContent} species={species} sourceMaps={previewSourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </article>
          )}
          {draftContent.sections.right && draftContent.sections.right.length > 0 && (
            <aside className="w-52 shrink-0 sticky top-6 self-start">
              <ArticleSectionRenderer sectionKey="right" content={draftContent} species={species} sourceMaps={previewSourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
            </aside>
          )}
        </div>
      )}

      {/* Content — edit mode */}
      {isEditMode && !isPreview && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={(e) => setActiveId(String(e.active.id))}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
            <aside className="w-44 shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Esquerda</p>
              <ArticleEditorSection
                sectionKey="left"
                items={editor.sections.left}
                onAdd={(index, item) => editor.addItem("left", index, item)}
                onRemove={(itemId) => editor.removeItem("left", itemId)}
                onUpdate={(itemId, block) => editor.updateBlockContent("left", itemId, block)}
                onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)}
              />
            </aside>
            <article className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Centro</p>
              <ArticleEditorSection
                sectionKey="center"
                items={editor.sections.center}
                onAdd={(index, item) => editor.addItem("center", index, item)}
                onRemove={(itemId) => editor.removeItem("center", itemId)}
                onUpdate={(itemId, block) => editor.updateBlockContent("center", itemId, block)}
                onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)}
              />
            </article>
            <aside className="w-52 shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Direita</p>
              <ArticleEditorSection
                sectionKey="right"
                items={editor.sections.right}
                onAdd={(index, item) => editor.addItem("right", index, item)}
                onRemove={(itemId) => editor.removeItem("right", itemId)}
                onUpdate={(itemId, block) => editor.updateBlockContent("right", itemId, block)}
                onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)}
              />
            </aside>
          </div>

          <DragOverlay>
            {activeItem && (
              <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                {activeItem.kind === "default" ? (
                  <span className="text-xs text-muted-foreground">{activeItem.name}</span>
                ) : (
                  <span className="text-xs text-muted-foreground capitalize">{activeItem.block.type}</span>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function Breadcrumb({ nodes }: { nodes: Array<{ id: number; labelValue: string }> }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-neutral-600 flex-wrap">
      {nodes.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-400">&gt;</span>}
          <span className="underline">{node.labelValue}</span>
        </span>
      ))}
    </nav>
  );
}

function HeroImage({ image, alt }: { image: ArticleImage | undefined; alt: string }) {
  if (!image) {
    return (
      <div className="bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
        Sem imagem
      </div>
    );
  }
  return (
    <img
      src={image.url}
      alt={image.alt ?? alt}
      className="w-full grid-cols-[2fr] h-full"
    />
  );
}

function ThumbnailImage({ image, alt }: { image: ArticleImage; alt: string }) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <img
        src={image.url}
        alt={image.alt ?? alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

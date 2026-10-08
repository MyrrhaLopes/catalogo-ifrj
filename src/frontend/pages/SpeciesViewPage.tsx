import { useState, useMemo } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "../rootRoute";
import { useGetSpeciesDetails } from "../features/species/hooks/useGetSpeciesDetails";
import { PageShell } from "../components/layout/PageShell";
import { SpeciesHero } from "../features/species/components/SpeciesHero";
import { ArticleLayout } from "../features/article/components/ArticleLayout";
import { ArticleEditController } from "../features/article/components/ArticleEditController";
import { ArticleEditorHeader } from "../features/article/components/editor/ArticleEditorHeader";
import { useArticleEditor } from "../features/article/hooks/useArticleEditor";
import { useSaveArticle } from "../features/article/hooks/useSaveArticle";
import useAuth from "../shared/hooks/useAuth";
import { computeUnifiedSources, buildSourceMaps } from "../features/article/components/utils";
import type { SpeciesDetails } from "../features/species/species.api";

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
      <PageShell>
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">Carregando...</div>
      </PageShell>
    );
  }
  if (error || !species) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">Espécie não encontrada.</div>
      </PageShell>
    );
  }
  return <SpeciesViewLoaded id={id} species={species} editArticle={search.editArticle} />;
}

type LoadedProps = { id: string; species: SpeciesDetails; editArticle?: boolean };

function SpeciesViewLoaded({ id, species, editArticle }: LoadedProps) {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true;
  const isEditMode = editArticle === true && isAdmin;
  const [isPreview, setIsPreview] = useState(false);

  const editor = useArticleEditor(Number(id), species.article);
  const saveArticle = useSaveArticle(Number(id), species.article?.id ?? null);

  const lastNode = species.taxonomyPath.at(-1);
  const secondLastNode = species.taxonomyPath.at(-2);
  const scientificName =
    lastNode?.label === "Espécie" && secondLastNode
      ? `${secondLastNode.labelValue} ${lastNode.labelValue}`
      : (lastNode?.labelValue ?? "Espécie");
  const popularName = species.popularNames[0]?.name;
  const content = species.article?.content;
  const inlineSources = species.sources;

  const attributeSources = useMemo(
    () => species.attributes.filter((a) => a.sourceUrl != null).map((a) => ({ url: a.sourceUrl! })),
    [species.attributes],
  );
  const sourceMaps = useMemo(() => {
    if (!content) return { byId: new Map<number, number>(), byUrl: new Map<string, number>() };
    return buildSourceMaps(computeUnifiedSources(content, inlineSources, attributeSources));
  }, [content, inlineSources, attributeSources]);

  const draftContent = isPreview ? editor.toDraftContent() : null;
  const previewSourceMaps = useMemo(() => {
    if (!draftContent) return { byId: new Map<number, number>(), byUrl: new Map<string, number>() };
    return buildSourceMaps(computeUnifiedSources(draftContent, inlineSources, attributeSources));
  }, [draftContent, inlineSources, attributeSources]);

  function handleSave() {
    saveArticle.mutate(editor.toDraftContent(), {
      onSuccess: () => {
        editor.clearDraft();
        void navigate({ to: "/especies/$id", params: { id }, search: {} });
      },
    });
  }

  return (
    <PageShell className="bg-white">
      {isEditMode && (
        <ArticleEditorHeader
          mode={isPreview ? "preview" : "edit"}
          isSaving={saveArticle.isPending}
          onPreview={() => setIsPreview(true)}
          onSave={handleSave}
          onCancel={() => { editor.clearDraft(); void navigate({ to: "/especies/$id", params: { id }, search: {} }); }}
          onBackToEdit={() => setIsPreview(false)}
        />
      )}
      <SpeciesHero species={species} scientificName={scientificName} popularName={popularName} isAdmin={isAdmin} isEditMode={isEditMode} id={id} />
      {!isEditMode && content && (
        <ArticleLayout content={content} species={species} sourceMaps={sourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
      )}
      {isEditMode && isPreview && draftContent && (
        <ArticleLayout content={draftContent} species={species} sourceMaps={previewSourceMaps} inlineSources={inlineSources} attributeSources={attributeSources} />
      )}
      {isEditMode && !isPreview && <ArticleEditController id={id} editor={editor} />}
    </PageShell>
  );
}

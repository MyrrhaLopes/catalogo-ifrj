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
import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { SourceMaps } from "../features/article/components/types";
import { getScientificName } from "@/frontend/shared/utils/taxonomy";

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

function getAttributeSources(attributes: SpeciesDetails["attributes"]): { url: string }[] {
  return attributes.filter((a) => a.sourceUrl != null).map((a) => ({ url: a.sourceUrl! }));
}

function getUnifiedSourceMaps(
  content: ArticleContent | null | undefined,
  inlineSources: SpeciesDetails["sources"],
  attributeSources: { url: string }[],
): SourceMaps {
  if (!content) {
    return { byId: new Map<number, number>(), byUrl: new Map<string, number>() };
  }
  return buildSourceMaps(computeUnifiedSources(content, inlineSources, attributeSources));
}

function useSpeciesSourceMaps(
  content: ArticleContent | null | undefined,
  draftContent: ArticleContent | null,
  inlineSources: SpeciesDetails["sources"],
  attributeSources: { url: string }[],
) {
  const sourceMaps = useMemo(
    () => getUnifiedSourceMaps(content, inlineSources, attributeSources),
    [content, inlineSources, attributeSources],
  );
  const previewSourceMaps = useMemo(
    () => getUnifiedSourceMaps(draftContent, inlineSources, attributeSources),
    [draftContent, inlineSources, attributeSources],
  );
  return { sourceMaps, previewSourceMaps };
}

type ArticleContentProps = {
  content: ArticleContent;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  attributeSources: { url: string }[];
};

function SpeciesViewModeContent({ content, species, sourceMaps, attributeSources }: ArticleContentProps) {
  return (
    <ArticleLayout
      content={content}
      species={species}
      sourceMaps={sourceMaps}
      inlineSources={species.sources}
      attributeSources={attributeSources}
    />
  );
}

type EditModeContentProps = {
  id: string;
  isPreview: boolean;
  draftContent: ArticleContent | null;
  species: SpeciesDetails;
  previewSourceMaps: SourceMaps;
  attributeSources: { url: string }[];
  editor: ReturnType<typeof useArticleEditor>;
};

function SpeciesEditModeContent({
  id,
  isPreview,
  draftContent,
  species,
  previewSourceMaps,
  attributeSources,
  editor,
}: EditModeContentProps) {
  if (isPreview && draftContent) {
    return (
      <ArticleLayout
        content={draftContent}
        species={species}
        sourceMaps={previewSourceMaps}
        inlineSources={species.sources}
        attributeSources={attributeSources}
      />
    );
  }
  return <ArticleEditController id={id} editor={editor} />;
}

function getDraftContent(isPreview: boolean, editor: ReturnType<typeof useArticleEditor>): ArticleContent | null {
  if (isPreview) {
    return editor.toDraftContent();
  }
  return null;
}

function getArticleId(article: SpeciesDetails["article"]): number | null {
  if (article && article.id) {
    return article.id;
  }
  return null;
}

function checkIsEditMode(isAdmin: boolean, editArticle?: boolean): boolean {
  if (!isAdmin) {
    return false;
  }
  return editArticle === true;
}

function getPopularName(species: SpeciesDetails): string | undefined {
  const first = species.popularNames[0];
  if (first) {
    return first.name;
  }
  return undefined;
}

function useSpeciesViewState(id: string, species: SpeciesDetails, editArticle?: boolean) {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user ? user.isAdmin === true : false;
  const isEditMode = checkIsEditMode(isAdmin, editArticle);
  const [isPreview, setIsPreview] = useState(false);

  const articleId = getArticleId(species.article);
  const editor = useArticleEditor(Number(id), species.article);
  const saveArticle = useSaveArticle(Number(id), articleId);

  const attributeSources = useMemo(() => getAttributeSources(species.attributes), [species.attributes]);
  const draftContent = getDraftContent(isPreview, editor);
  const content = species.article ? species.article.content : null;

  const { sourceMaps, previewSourceMaps } = useSpeciesSourceMaps(
    content,
    draftContent,
    species.sources,
    attributeSources,
  );

  const resetAndExit = () => {
    editor.clearDraft();
    void navigate({ to: "/especies/$id", params: { id }, search: {} });
  };

  const handleSave = () => {
    saveArticle.mutate(editor.toDraftContent(), { onSuccess: resetAndExit });
  };

  return {
    isAdmin,
    isEditMode,
    isPreview,
    setIsPreview,
    editor,
    isSaving: saveArticle.isPending,
    draftContent,
    content,
    attributeSources,
    sourceMaps,
    previewSourceMaps,
    resetAndExit,
    handleSave,
  };
}

function SpeciesViewHeader({
  isEditMode,
  isPreview,
  isSaving,
  onPreview,
  onSave,
  onCancel,
  onBackToEdit,
}: {
  isEditMode: boolean;
  isPreview: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBackToEdit: () => void;
}) {
  if (!isEditMode) {
    return null;
  }
  const mode = isPreview ? "preview" : "edit";
  return (
    <ArticleEditorHeader
      mode={mode}
      isSaving={isSaving}
      onPreview={onPreview}
      onSave={onSave}
      onCancel={onCancel}
      onBackToEdit={onBackToEdit}
    />
  );
}

function SpeciesViewBody({
  isEditMode,
  isPreview,
  draftContent,
  content,
  species,
  sourceMaps,
  previewSourceMaps,
  attributeSources,
  id,
  editor,
}: {
  isEditMode: boolean;
  isPreview: boolean;
  draftContent: ArticleContent | null;
  content: ArticleContent | null | undefined;
  species: SpeciesDetails;
  sourceMaps: SourceMaps;
  previewSourceMaps: SourceMaps;
  attributeSources: { url: string }[];
  id: string;
  editor: ReturnType<typeof useArticleEditor>;
}) {
  if (isEditMode) {
    return (
      <SpeciesEditModeContent
        id={id}
        isPreview={isPreview}
        draftContent={draftContent}
        species={species}
        previewSourceMaps={previewSourceMaps}
        attributeSources={attributeSources}
        editor={editor}
      />
    );
  }
  if (!content) {
    return null;
  }
  return (
    <SpeciesViewModeContent
      content={content}
      species={species}
      sourceMaps={sourceMaps}
      attributeSources={attributeSources}
    />
  );
}

function SpeciesViewLoaded({ id, species, editArticle }: LoadedProps) {
  const state = useSpeciesViewState(id, species, editArticle);
  const scientificName = getScientificName(species.taxonomyPath, "Espécie");
  const popularName = getPopularName(species);

  return (
    <PageShell className="bg-white">
      <SpeciesViewHeader
        isEditMode={state.isEditMode}
        isPreview={state.isPreview}
        isSaving={state.isSaving}
        onPreview={() => state.setIsPreview(true)}
        onSave={state.handleSave}
        onCancel={state.resetAndExit}
        onBackToEdit={() => state.setIsPreview(false)}
      />
      <SpeciesHero
        species={species}
        scientificName={scientificName}
        popularName={popularName}
        isAdmin={state.isAdmin}
        isEditMode={state.isEditMode}
        id={id}
      />
      <SpeciesViewBody
        isEditMode={state.isEditMode}
        isPreview={state.isPreview}
        draftContent={state.draftContent}
        content={state.content}
        species={species}
        sourceMaps={state.sourceMaps}
        previewSourceMaps={state.previewSourceMaps}
        attributeSources={state.attributeSources}
        id={id}
        editor={state.editor}
      />
    </PageShell>
  );
}

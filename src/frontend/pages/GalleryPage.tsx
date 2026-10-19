import { useState, useMemo, useDeferredValue, useRef } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import { useGallery } from "../features/gallery/hooks/useGallery";
import { ImageViewer } from "../features/images/components/ImageViewer";
import { GalleryMainContent } from "../features/gallery/components/GalleryMainContent";
import { GallerySidebar } from "../features/gallery/components/GallerySidebar";
import type { EnrichedImage, GroupBy, Origin, ThumbSize } from "../features/gallery/gallery.api";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";
import {
  countImagesByOrigin,
  extractTaxonomyLabels,
  filterGalleryImages,
  groupImages,
} from "../features/gallery/utils/galleryData";

const gallerySearchSchema = z.object({
  search: z.string().optional().default(""),
  origin: z.enum(["all", "acervo", "online"]).optional().default("all"),
  groupBy: z.enum(["especie", "familia", "ordem", "data"]).optional().default("especie"),
  taxPath: z.array(z.string()).optional().default([]),
  thumbSize: z.enum(["small", "medium", "large"]).optional().default("medium"),
});

export const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/galeria",
  validateSearch: (search: Record<string, unknown>) => gallerySearchSchema.parse(search),
  component: GalleryPage,
});

function useGalleryViewerState() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<EnrichedImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  function openViewer(images: EnrichedImage[], index: number) {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  }

  function closeViewer() {
    setViewerOpen(false);
  }

  return { viewerOpen, viewerImages, viewerIndex, setViewerIndex, openViewer, closeViewer };
}

function useGalleryFiltersState(
  urlSearch: { search: string; origin: Origin; groupBy: GroupBy; taxPath: string[]; thumbSize: ThumbSize },
) {
  const navigate = useNavigate({ from: "/galeria" });
  const { search, origin, groupBy, taxPath, thumbSize } = urlSearch;
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const deferredSearch = useDeferredValue(searchInput);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, search: value }), replace: true });
    }, 250);
  }

  function setOrigin(value: Origin) {
    void navigate({ search: (prev) => ({ ...prev, origin: value }), replace: true });
  }
  function setGroupBy(value: GroupBy) {
    void navigate({ search: (prev) => ({ ...prev, groupBy: value }), replace: true });
  }
  function setTaxPath(value: string[]) {
    void navigate({ search: (prev) => ({ ...prev, taxPath: value }), replace: true });
  }
  function setThumbSize(value: ThumbSize) {
    void navigate({ search: (prev) => ({ ...prev, thumbSize: value }), replace: true });
  }

  return {
    search,
    origin,
    groupBy,
    taxPath,
    thumbSize,
    searchInput,
    deferredSearch,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    handleSearchChange,
    setOrigin,
    setGroupBy,
    setTaxPath,
    setThumbSize,
  };
}

function useGalleryState() {
  const { data: allImages = [], isLoading, isError } = useGallery();
  const urlSearch = galleryRoute.useSearch();

  const filters = useGalleryFiltersState(urlSearch);
  const viewer = useGalleryViewerState();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const taxLabels = useMemo(() => extractTaxonomyLabels(allImages), [allImages]);
  const filtered = useMemo(
    () => filterGalleryImages(allImages, filters.origin, taxLabels, filters.taxPath, filters.deferredSearch),
    [allImages, filters.origin, taxLabels, filters.taxPath, filters.deferredSearch],
  );
  const groups = useMemo(() => groupImages(filtered, filters.groupBy), [filtered, filters.groupBy]);
  const { acervoTotal, onlineTotal } = useMemo(() => countImagesByOrigin(allImages), [allImages]);
  const activeFilterCount = (filters.origin !== "all" ? 1 : 0) + filters.taxPath.filter(Boolean).length;

  return {
    allImages,
    isLoading,
    isError,
    ...filters,
    ...viewer,
    expanded,
    toggleGroup,
    taxLabels,
    filtered,
    groups,
    acervoTotal,
    onlineTotal,
    activeFilterCount,
  };
}

function GalleryPage() {
  const g = useGalleryState();

  return (
    <PageShell className="bg-white">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10 tv:max-w-screen-2xl tv:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-700 sm:text-3xl tv:text-4xl">Galeria</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-xl tv:text-base">
            Fotografias tiradas dos exemplares do acervo físico e imagens de referência encontradas
            online, reunidas em um só lugar.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={g.searchInput}
              onChange={(e) => g.handleSearchChange(e.target.value)}
              placeholder="Filtrar por espécie, nome popular, código (IFRJ-002) ou descrição..."
              className="pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => g.setMobileFiltersOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {g.activeFilterCount > 0 && (
              <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">{g.activeFilterCount}</span>
            )}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", g.mobileFiltersOpen && "rotate-180")} />
          </button>
        </div>

        {!g.isLoading && !g.isError && (
          <p className="text-xs text-neutral-500 mb-6 tv:text-sm">
            {g.filtered.length} {g.filtered.length === 1 ? "imagem" : "imagens"} em{" "}
            {g.groups.length} {g.groups.length === 1 ? "grupo" : "grupos"}
            {g.filtered.length > 0 && (
              <span className="ml-2 text-neutral-400 hidden sm:inline">
                · Clique em uma imagem para ver detalhes, fonte e exemplar
              </span>
            )}
          </p>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 tv:gap-12">
          <div className="order-2 min-w-0 flex-1 lg:order-1">
            <GalleryMainContent
              isLoading={g.isLoading}
              isError={g.isError}
              groups={g.groups}
              hasActiveFilters={Boolean(g.search) || g.activeFilterCount > 0}
              thumbSize={g.thumbSize}
              expanded={g.expanded}
              onToggleGroup={g.toggleGroup}
              onOpenViewer={g.openViewer}
            />
          </div>

          <aside
            className={cn(
              "order-1 lg:order-2 lg:block lg:w-56 lg:shrink-0 tv:w-64",
              g.mobileFiltersOpen ? "block" : "hidden",
            )}
          >
            <div className="rounded-lg border border-neutral-200 p-4 lg:border-0 lg:p-0">
              <GallerySidebar
                allImages={g.allImages}
                acervoTotal={g.acervoTotal}
                onlineTotal={g.onlineTotal}
                origin={g.origin}
                onOriginChange={g.setOrigin}
                groupBy={g.groupBy}
                onGroupByChange={g.setGroupBy}
                taxLabels={g.taxLabels}
                taxPath={g.taxPath}
                onTaxPathChange={g.setTaxPath}
                thumbSize={g.thumbSize}
                onThumbSizeChange={g.setThumbSize}
              />
            </div>
          </aside>
        </div>
      </main>

      <ImageViewer
        images={g.viewerImages}
        open={g.viewerOpen}
        currentIndex={g.viewerIndex}
        onClose={g.closeViewer}
        onNavigate={g.setViewerIndex}
      />
    </PageShell>
  );
}

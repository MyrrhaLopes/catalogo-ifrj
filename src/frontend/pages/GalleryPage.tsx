import { useState, useMemo } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ImageIcon, Loader2, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { rootRoute } from "../rootRoute";
import { PageShell } from "../components/layout/PageShell";
import { useGallery } from "../features/gallery/hooks/useGallery";
import { ImageViewer } from "../features/images/components/ImageViewer";
import { SpeciesGroup, type ImageGroup } from "../features/gallery/components/SpeciesGroup";
import { GallerySidebar } from "../features/gallery/components/GallerySidebar";
import type { EnrichedImage, GroupBy, Origin, ThumbSize } from "../features/gallery/gallery.api";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";

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

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"] as const;

function groupImages(images: EnrichedImage[], by: GroupBy): ImageGroup[] {
  const map = new Map<
    string,
    { images: EnrichedImage[]; label: string; sublabel: string | null; speciesId: number | null }
  >();

  for (const img of images) {
    let key: string;
    let label: string;
    let sublabel: string | null = null;
    let speciesId: number | null = null;

    if (by === "especie") {
      key = String(img.speciesId);
      label = img.speciesName;
      sublabel = img.popularName;
      speciesId = img.speciesId;
    } else if (by === "familia") {
      const node = img.taxonomyPath.find((n) => n.label === "Família");
      key = node?.labelValue ?? "__sem_familia";
      label = node?.labelValue ?? "Família desconhecida";
    } else if (by === "ordem") {
      const node = img.taxonomyPath.find((n) => n.label === "Ordem");
      key = node?.labelValue ?? "__sem_ordem";
      label = node?.labelValue ?? "Ordem desconhecida";
    } else {
      const d = new Date(img.createdAt);
      key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      label = `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
    }

    if (!map.has(key)) map.set(key, { images: [], label, sublabel, speciesId });
    map.get(key)!.images.push(img);
  }

  return [...map.entries()].map(([key, { images: imgs, label, sublabel, speciesId }]) => ({
    key,
    label,
    sublabel,
    speciesId,
    acervoCount: imgs.filter((i) => i.type === "acervo").length,
    onlineCount: imgs.filter((i) => i.type === "online").length,
    images: imgs,
  }));
}

const GRID_COLS: Record<ThumbSize, string> = {
  small: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 tv:grid-cols-8",
  medium: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 tv:grid-cols-7",
  large: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 tv:grid-cols-5",
};

function GalleryPage() {
  const { data: allImages = [], isLoading, isError } = useGallery();
  const urlSearch = galleryRoute.useSearch();
  const navigate = useNavigate({ from: "/galeria" });

  const search = urlSearch.search;
  const origin = urlSearch.origin;
  const groupBy = urlSearch.groupBy;
  const taxPath = urlSearch.taxPath;
  const thumbSize = urlSearch.thumbSize;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  function setSearch(value: string) {
    void navigate({ search: (prev) => ({ ...prev, search: value || "" }), replace: true });
  }
  function setOrigin(value: Origin) {
    void navigate({ search: (prev) => ({ ...prev, origin: value }), replace: true });
  }
  function setGroupBy(value: GroupBy) {
    void navigate({ search: (prev) => ({ ...prev, groupBy: value }), replace: true });
  }
  function setTaxPath(value: string[]) {
    void navigate({ search: (prev) => ({ ...prev, taxPath: value.length > 0 ? value : [] }), replace: true });
  }
  function setThumbSize(value: ThumbSize) {
    void navigate({ search: (prev) => ({ ...prev, thumbSize: value }), replace: true });
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<EnrichedImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  function openViewer(images: EnrichedImage[], index: number) {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  }

  const taxLabels = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const img of allImages) {
      for (const node of img.taxonomyPath) {
        if (!seen.has(node.label)) { seen.add(node.label); order.push(node.label); }
      }
    }
    return order;
  }, [allImages]);

  const filtered = useMemo(() => {
    let imgs = allImages;

    if (origin !== "all") imgs = imgs.filter((i) => i.type === origin);

    for (let i = 0; i < taxPath.length; i++) {
      const label = taxLabels[i];
      const val = taxPath[i];
      if (label && val) {
        imgs = imgs.filter((img) => img.taxonomyPath.find((n) => n.label === label)?.labelValue === val);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      imgs = imgs.filter(
        (i) =>
          i.speciesName.toLowerCase().includes(q) ||
          (i.popularName?.toLowerCase().includes(q) ?? false) ||
          (i.specimen?.code.toLowerCase().includes(q) ?? false) ||
          (i.alt?.toLowerCase().includes(q) ?? false),
      );
    }

    return imgs;
  }, [allImages, origin, taxPath, taxLabels, search]);

  const groups = useMemo(() => groupImages(filtered, groupBy), [filtered, groupBy]);

  const acervoTotal = allImages.filter((i) => i.type === "acervo").length;
  const onlineTotal = allImages.filter((i) => i.type === "online").length;
  const activeFilterCount = (origin !== "all" ? 1 : 0) + taxPath.filter(Boolean).length;

  return (
    <PageShell className="bg-white">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 tv:max-w-screen-2xl tv:px-10">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por espécie, nome popular, código (IFRJ-002) ou descrição..."
              className="pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">{activeFilterCount}</span>
            )}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mobileFiltersOpen && "rotate-180")} />
          </button>
        </div>

        {!isLoading && !isError && (
          <p className="text-xs text-neutral-500 mb-6 tv:text-sm">
            {filtered.length} {filtered.length === 1 ? "imagem" : "imagens"} em{" "}
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            {filtered.length > 0 && (
              <span className="ml-2 text-neutral-400 hidden sm:inline">
                · Clique em uma imagem para ver detalhes, fonte e exemplar
              </span>
            )}
          </p>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 tv:gap-12">
          <div className="order-2 min-w-0 flex-1 lg:order-1">
            {isLoading && (
              <div className="flex items-center justify-center h-64 text-neutral-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Carregando galeria…
              </div>
            )}
            {isError && (
              <div className="flex items-center justify-center h-64 text-destructive text-sm">
                Erro ao carregar as imagens.
              </div>
            )}
            {!isLoading && !isError && groups.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-400">
                <ImageIcon className="h-10 w-10" />
                <p className="text-sm">
                  {search || origin !== "all" || taxPath.length > 0
                    ? "Nenhuma imagem encontrada para os filtros aplicados."
                    : "Nenhuma imagem cadastrada."}
                </p>
              </div>
            )}
            {!isLoading &&
              !isError &&
              groups.map((group) => (
                <SpeciesGroup
                  key={group.key}
                  group={group}
                  gridCols={GRID_COLS[thumbSize]}
                  expanded={expanded.has(group.key)}
                  onToggleExpand={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(group.key) ? next.delete(group.key) : next.add(group.key);
                      return next;
                    })
                  }
                  onOpenViewer={openViewer}
                />
              ))}
          </div>

          <aside
            className={cn(
              "order-1 lg:order-2 lg:block lg:w-56 lg:shrink-0 tv:w-64",
              mobileFiltersOpen ? "block" : "hidden",
            )}
          >
            <div className="rounded-lg border border-neutral-200 p-4 lg:border-0 lg:p-0">
              <GallerySidebar
                allImages={allImages}
                acervoTotal={acervoTotal}
                onlineTotal={onlineTotal}
                origin={origin}
                onOriginChange={setOrigin}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                taxLabels={taxLabels}
                taxPath={taxPath}
                onTaxPathChange={setTaxPath}
                thumbSize={thumbSize}
                onThumbSizeChange={setThumbSize}
              />
            </div>
          </aside>
        </div>
      </main>

      <ImageViewer
        images={viewerImages}
        open={viewerOpen}
        currentIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
        onNavigate={setViewerIndex}
      />
    </PageShell>
  );
}

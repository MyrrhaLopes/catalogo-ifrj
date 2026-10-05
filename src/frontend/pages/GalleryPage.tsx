import { useState, useMemo } from "react";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Globe, Camera, ChevronRight, ImageIcon, Loader2, Search } from "lucide-react";
import { rootRoute } from "../rootRoute";
import { CatalogHeader } from "../components/CatalogHeader";
import { useGallery } from "../features/gallery/hooks/useGallery";
import { ImageViewer } from "../features/images/components/ImageViewer";
import type { EnrichedImage } from "../features/gallery/gallery.api";
import { Input } from "../components/ui/input";

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

// ─── Types ───────────────────────────────────────────────────────────────────

type GroupBy = z.infer<typeof gallerySearchSchema>["groupBy"];
type Origin = z.infer<typeof gallerySearchSchema>["origin"];
type ThumbSize = z.infer<typeof gallerySearchSchema>["thumbSize"];

type ImageGroup = {
  key: string;
  label: string;
  sublabel: string | null;
  speciesId: number | null;
  acervoCount: number;
  onlineCount: number;
  images: EnrichedImage[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"] as const;

function buildGroupMeta(images: EnrichedImage[]): string {
  const first = images[0];
  if (!first) return "";
  const parts: string[] = [];
  if (first.popularName) parts.push(first.popularName);
  const family = first.taxonomyPath.find((n) => n.label === "Família")?.labelValue;
  if (family) parts.push(family);
  const specimenCode = images.find((i) => i.type === "acervo" && i.specimen)?.specimen?.code;
  if (specimenCode) parts.push(`exemplar ${specimenCode}`);
  return parts.join(" · ");
}

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
  small: "grid-cols-6",
  medium: "grid-cols-5",
  large: "grid-cols-4",
};

// ─── Main page ────────────────────────────────────────────────────────────────

function GalleryPage() {
  const { data: allImages = [], isLoading, isError } = useGallery();
  const urlSearch = galleryRoute.useSearch();
  const navigate = useNavigate({ from: "/galeria" });

  const search = urlSearch.search;
  const origin = urlSearch.origin;
  const groupBy = urlSearch.groupBy;
  const taxPath = urlSearch.taxPath;
  const thumbSize = urlSearch.thumbSize;

  function setSearch(value: string) {
    void navigate({ search: (prev) => ({ ...prev, search: value || undefined }), replace: true });
  }
  function setOrigin(value: Origin) {
    void navigate({ search: (prev) => ({ ...prev, origin: value }), replace: true });
  }
  function setGroupBy(value: GroupBy) {
    void navigate({ search: (prev) => ({ ...prev, groupBy: value }), replace: true });
  }
  function setTaxPath(value: string[]) {
    void navigate({ search: (prev) => ({ ...prev, taxPath: value.length > 0 ? value : undefined }), replace: true });
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

  // Ordered distinct taxonomy labels derived from the data
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

  // Filter pipeline
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

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700">Galeria</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-xl">
            Fotografias tiradas dos exemplares do acervo físico e imagens de referência encontradas
            online, reunidas em um só lugar.
          </p>
        </div>

        {/* Search + sort row */}
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
        </div>

        {/* Counter row */}
        {!isLoading && !isError && (
          <p className="text-xs text-neutral-500 mb-6">
            {filtered.length} {filtered.length === 1 ? "imagem" : "imagens"} em{" "}
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            {filtered.length > 0 && (
              <span className="ml-2 text-neutral-400">
                · Clique em uma imagem para ver detalhes, fonte e exemplar
              </span>
            )}
          </p>
        )}

        <div className="flex gap-8">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
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

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0 space-y-6 pt-1">
            {/* ORIGEM */}
            <SidebarSection title="Origem">
              <div className="flex flex-wrap gap-1.5">
                <ChipButton active={origin === "all"} onClick={() => setOrigin("all")}>
                  Todas {allImages.length}
                </ChipButton>
                <ChipButton active={origin === "acervo"} onClick={() => setOrigin("acervo")}>
                  Acervo IFRJ {acervoTotal}
                </ChipButton>
                <ChipButton active={origin === "online"} onClick={() => setOrigin("online")}>
                  Online {onlineTotal}
                </ChipButton>
              </div>
              <div className="mt-2 space-y-1.5 text-xs text-neutral-500">
                <div className="flex items-start gap-1.5">
                  <Camera className="h-3 w-3 mt-0.5 shrink-0 text-green-700" />
                  <p>
                    <strong>Acervo IFRJ</strong> — fotos tiradas presencialmente, sempre ligadas a
                    um exemplar (código, prateleira e lote).
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <Globe className="h-3 w-3 mt-0.5 shrink-0 text-neutral-500" />
                  <p>
                    <strong>Online</strong> — imagens de referência da espécie.
                  </p>
                </div>
              </div>
            </SidebarSection>

            {/* AGRUPAR POR */}
            <SidebarSection title="Agrupar por">
              <div className="flex flex-wrap gap-1.5">
                <ChipButton active={groupBy === "especie"} onClick={() => setGroupBy("especie")}>
                  Espécie
                </ChipButton>
                <ChipButton active={groupBy === "familia"} onClick={() => setGroupBy("familia")}>
                  Família
                </ChipButton>
                <ChipButton active={groupBy === "ordem"} onClick={() => setGroupBy("ordem")}>
                  Ordem
                </ChipButton>
                <ChipButton active={groupBy === "data"} onClick={() => setGroupBy("data")}>
                  Data de adição
                </ChipButton>
              </div>
            </SidebarSection>

            {/* NÍVEIS TAXONÔMICOS */}
            {taxLabels.length > 0 && (
              <SidebarSection title="Níveis taxonômicos">
                <CascadingTaxFilter
                  allImages={allImages}
                  taxLabels={taxLabels}
                  taxPath={taxPath}
                  onChange={setTaxPath}
                />
              </SidebarSection>
            )}

            {/* MINIATURAS */}
            <SidebarSection title="Miniaturas">
              <div className="flex gap-1.5">
                <ChipButton active={thumbSize === "small"} onClick={() => setThumbSize("small")}>
                  Pequenas
                </ChipButton>
                <ChipButton active={thumbSize === "medium"} onClick={() => setThumbSize("medium")}>
                  Médias
                </ChipButton>
                <ChipButton active={thumbSize === "large"} onClick={() => setThumbSize("large")}>
                  Grandes
                </ChipButton>
              </div>
            </SidebarSection>
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
    </div>
  );
}

// ─── Species group ────────────────────────────────────────────────────────────

type GroupProps = {
  group: ImageGroup;
  gridCols: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenViewer: (images: EnrichedImage[], index: number) => void;
};

const MAX_PREVIEW = 4;

function SpeciesGroup({ group, gridCols, expanded, onToggleExpand, onOpenViewer }: GroupProps) {
  const visibleImages =
    !expanded && group.images.length > MAX_PREVIEW + 1
      ? group.images.slice(0, MAX_PREVIEW)
      : group.images;
  const overflow = group.images.length - MAX_PREVIEW;
  const showOverflow = !expanded && overflow > 0 && group.images.length > MAX_PREVIEW + 1;

  const meta = group.sublabel ?? buildGroupMeta(group.images);

  return (
    <div className="mb-10">
      {/* Group header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold italic text-neutral-900">{group.label}</h2>
          {meta && <p className="text-xs text-neutral-500 mt-0.5">{meta}</p>}
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-xs text-neutral-500">
            {group.acervoCount > 0 && `${group.acervoCount} do acervo`}
            {group.acervoCount > 0 && group.onlineCount > 0 && " · "}
            {group.onlineCount > 0 && `${group.onlineCount} online`}
          </p>
          {group.speciesId != null && (
            <Link
              to="/especies/$id"
              params={{ id: String(group.speciesId) }}
              className="text-xs text-green-700 hover:underline inline-flex items-center gap-0.5 mt-0.5"
            >
              Ver artigo
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Image grid */}
      <div className={`grid ${gridCols} gap-2`}>
        {visibleImages.map((img, i) => (
          <ImageCard
            key={img.id}
            image={img}
            onClick={() => onOpenViewer(group.images, i)}
          />
        ))}
        {showOverflow && (
          <button
            onClick={onToggleExpand}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <span className="text-lg font-semibold">+{overflow}</span>
            <span className="text-xs">ver todas</span>
          </button>
        )}
        {expanded && (
          <button
            onClick={onToggleExpand}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors text-xs"
          >
            Ocultar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Image card ───────────────────────────────────────────────────────────────

function ImageCard({ image, onClick }: { image: EnrichedImage; onClick: () => void }) {
  const isAcervo = image.type === "acervo";
  const sourceLabel = isAcervo && image.specimen
    ? `${image.specimen.code}${image.specimen.shelf != null ? ` · Prat. ${image.specimen.shelf}` : ""}${image.specimen.lot != null ? ` · Lote ${image.specimen.lot}` : ""}`
    : image.source
      ? (() => { try { return new URL(image.source).hostname; } catch { return image.source; } })()
      : null;

  return (
    <button
      onClick={onClick}
      className="group text-left flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:shadow-md transition-shadow"
    >
      {/* Badge */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {image.url ? (
          <img
            src={image.url}
            alt={image.alt ?? ""}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-300">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <span
          className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isAcervo
              ? "bg-green-700 text-white"
              : "bg-white/90 text-neutral-700 border border-neutral-300"
          }`}
        >
          {isAcervo ? <Camera className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
          {isAcervo ? "Acervo" : "Online"}
        </span>
      </div>

      {/* Caption */}
      {(image.alt || sourceLabel) && (
        <div className="px-2 py-1.5">
          {image.alt && (
            <p className="text-[11px] text-neutral-700 leading-snug line-clamp-2">{image.alt}</p>
          )}
          {sourceLabel && (
            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{sourceLabel}</p>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Sidebar helpers ──────────────────────────────────────────────────────────

// ─── Cascading taxonomy filter ────────────────────────────────────────────────

function CascadingTaxFilter({
  allImages,
  taxLabels,
  taxPath,
  onChange,
}: {
  allImages: EnrichedImage[];
  taxLabels: string[];
  taxPath: string[];
  onChange: (path: string[]) => void;
}) {
  const lastSelectedIndex = taxPath.reduce((max, val, i) => (val ? i : max), -1);
  const visibleLabels = taxLabels.slice(0, lastSelectedIndex + 2);

  function getOptionsForLevel(levelIndex: number): string[] {
    let imgs = allImages;
    for (let i = 0; i < levelIndex; i++) {
      const label = taxLabels[i];
      const val = taxPath[i];
      if (label && val) {
        imgs = imgs.filter((img) => img.taxonomyPath.find((n) => n.label === label)?.labelValue === val);
      }
    }
    const label = taxLabels[levelIndex];
    const seen = new Set<string>();
    const opts: string[] = [];
    for (const img of imgs) {
      const val = img.taxonomyPath.find((n) => n.label === label)?.labelValue;
      if (val && !seen.has(val)) { seen.add(val); opts.push(val); }
    }
    return opts.sort();
  }

  function handleSelect(levelIndex: number, value: string) {
    const next = taxPath.slice(0, levelIndex);
    if (value) next.push(value);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {visibleLabels.map((label, index) => {
        const options = getOptionsForLevel(index);
        const selected = taxPath[index] ?? "";
        return (
          <div key={label} className={index > 0 ? "pl-2" : ""}>
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <select
              value={selected}
              onChange={(e) => handleSelect(index, e.target.value)}
              className="w-full rounded-md border border-input bg-white px-2 py-1.5 text-xs text-neutral-700 outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecionar {label.toLowerCase()}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
        active
          ? "bg-green-700 text-white border-green-700"
          : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

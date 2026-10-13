import { Camera, Globe } from "lucide-react";
import type { EnrichedImage, GroupBy, Origin, ThumbSize } from "../gallery.api";
import { CascadingTaxFilter } from "./CascadingTaxFilter";

type Props = {
  allImages: EnrichedImage[];
  acervoTotal: number;
  onlineTotal: number;
  origin: Origin;
  onOriginChange: (v: Origin) => void;
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  taxLabels: string[];
  taxPath: string[];
  onTaxPathChange: (v: string[]) => void;
  thumbSize: ThumbSize;
  onThumbSizeChange: (v: ThumbSize) => void;
};

export function GallerySidebar({
  allImages,
  acervoTotal,
  onlineTotal,
  origin,
  onOriginChange,
  groupBy,
  onGroupByChange,
  taxLabels,
  taxPath,
  onTaxPathChange,
  thumbSize,
  onThumbSizeChange,
}: Props) {
  return (
    <div className="space-y-6 pt-1">
      <SidebarSection title="Origem">
        <div className="flex flex-wrap gap-1.5">
          <ChipButton active={origin === "all"} onClick={() => onOriginChange("all")}>
            Todas {allImages.length}
          </ChipButton>
          <ChipButton active={origin === "acervo"} onClick={() => onOriginChange("acervo")}>
            Acervo IFRJ {acervoTotal}
          </ChipButton>
          <ChipButton active={origin === "online"} onClick={() => onOriginChange("online")}>
            Online {onlineTotal}
          </ChipButton>
        </div>
        <div className="mt-2 space-y-1.5 text-xs text-neutral-500 tv:text-sm">
          <div className="flex items-start gap-1.5">
            <Camera className="h-3 w-3 mt-0.5 shrink-0 text-green-700" />
            <p>
              <strong>Acervo IFRJ</strong> — fotos tiradas presencialmente, sempre ligadas a um
              exemplar (código, prateleira e lote).
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

      <SidebarSection title="Agrupar por">
        <div className="flex flex-wrap gap-1.5">
          <ChipButton active={groupBy === "especie"} onClick={() => onGroupByChange("especie")}>Espécie</ChipButton>
          <ChipButton active={groupBy === "familia"} onClick={() => onGroupByChange("familia")}>Família</ChipButton>
          <ChipButton active={groupBy === "ordem"} onClick={() => onGroupByChange("ordem")}>Ordem</ChipButton>
          <ChipButton active={groupBy === "data"} onClick={() => onGroupByChange("data")}>Data de adição</ChipButton>
        </div>
      </SidebarSection>

      {taxLabels.length > 0 && (
        <SidebarSection title="Níveis taxonômicos">
          <CascadingTaxFilter
            allImages={allImages}
            taxLabels={taxLabels}
            taxPath={taxPath}
            onChange={onTaxPathChange}
          />
        </SidebarSection>
      )}

      <SidebarSection title="Miniaturas">
        <div className="flex gap-1.5">
          <ChipButton active={thumbSize === "small"} onClick={() => onThumbSizeChange("small")}>Pequenas</ChipButton>
          <ChipButton active={thumbSize === "medium"} onClick={() => onThumbSizeChange("medium")}>Médias</ChipButton>
          <ChipButton active={thumbSize === "large"} onClick={() => onThumbSizeChange("large")}>Grandes</ChipButton>
        </div>
      </SidebarSection>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2 tv:text-xs">
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
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border tv:text-sm ${
        active
          ? "bg-green-700 text-white border-green-700"
          : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

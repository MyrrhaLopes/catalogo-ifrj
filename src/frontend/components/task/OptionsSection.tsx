import { Filter, Tag, LayoutGrid, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/shared/utils";
import {
  TASK_VIEW_OPTIONS,
  TASK_GROUPING_OPTIONS,
  TASK_PRAZO_OPTIONS,
} from "./task-options";
import type { HomeSearch } from "@/frontend/pages/HomePage";

const PRAZO_LABELS: Record<typeof TASK_PRAZO_OPTIONS[number], string> = {
  "sem-prazo": "Sem prazo",
  "hoje": "Hoje",
  "esta-semana": "Esta semana",
};

const STATUS_LABELS: Record<string, string> = {
  "to-do": "Pendente",
  "done": "Concluída",
  "in-progress": "Em progresso",
};

const GROUPING_LABELS: Record<typeof TASK_GROUPING_OPTIONS[number], string> = {
  "date": "Data de Prazo",
  "status": "Status",
  "no_grouping": "Sem agrupamento",
};

const VIEW_LABELS: Record<typeof TASK_VIEW_OPTIONS[number], string> = {
  "list": "Listas",
  "calendar": "Kanban",
};

type SetSearch = (patch: Partial<HomeSearch>) => void;

type OptionsSectionProps =
  | {
    variant: "filtro";
    prazo: HomeSearch["prazo"];
    status: HomeSearch["status"];
    set: SetSearch;
  }
  | {
    variant: "agrupamento";
    grouping: HomeSearch["grouping"];
    set: SetSearch;
  }
  | {
    variant: "visualizacoes";
    view: HomeSearch["view"];
    set: SetSearch;
  };

const SECTION_META = {
  filtro: { Icon: Filter, label: "Filtros" },
  agrupamento: { Icon: Tag, label: "Agrupamento" },
  visualizacoes: { Icon: LayoutGrid, label: "Visualizações" },
} as const;

export function OptionsSection(props: OptionsSectionProps) {
  const { Icon, label } = SECTION_META[props.variant];

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
        <Icon className="h-4 w-4" />
        {label}
      </span>

      {props.variant === "filtro" && <FiltroButtons {...props} />}
      {props.variant === "agrupamento" && <AgrupamentoButtons {...props} />}
      {props.variant === "visualizacoes" && <VisualizacoesButtons {...props} />}
    </div>
  );
}

function FiltroButtons({
  prazo,
  status,
  set,
}: {
  prazo: HomeSearch["prazo"];
  status: HomeSearch["status"];
  set: SetSearch;
}) {
  const prazoAtivo = prazo !== undefined;
  const statusAtivo = status !== "all";

  return (
    <>
      <div className="inline-flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/*            <Button
              variant="outline"
              size="xs"
              className={cn(prazoAtivo && "rounded-r-none border-r-0")}
            >
              <Clock className={cn(prazoAtivo ? "text-neutral-600" : "text-neutral-400")} />
              <span className={cn(!prazoAtivo && "text-neutral-400")}>
                {prazoAtivo ? PRAZO_LABELS[prazo] : "Selecionar prazo"}
              </span>
            </Button>
*/}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {TASK_PRAZO_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt} onClick={() => set({ prazo: opt })}>
                {PRAZO_LABELS[opt]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {prazoAtivo && (
          <button
            type="button"
            onClick={() => set({ prazo: undefined })}
            className="inline-flex items-center h-7 px-1.5 border rounded-r-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className="inline-flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="xs"
              className={cn(statusAtivo && "rounded-r-none border-r-0")}
            >
              <Check className={cn(statusAtivo ? "text-neutral-600" : "text-neutral-400")} />
              <span className={cn(!statusAtivo && "text-neutral-400")}>
                {statusAtivo ? STATUS_LABELS[status] : "Selecionar status"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => set({ status: "to-do" })}>Pendente</DropdownMenuItem>
            <DropdownMenuItem onClick={() => set({ status: "done" })}>Concluída</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {statusAtivo && (
          <button
            type="button"
            onClick={() => set({ status: "all" })}
            className="inline-flex items-center h-7 px-1.5 border rounded-r-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </>
  );
}

function AgrupamentoButtons({
  grouping,
  set,
}: {
  grouping: HomeSearch["grouping"];
  set: SetSearch;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs">
          {GROUPING_LABELS[grouping]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {TASK_GROUPING_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => set({ grouping: opt })}>
            {GROUPING_LABELS[opt]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VisualizacoesButtons({
  view,
  set,
}: {
  view: HomeSearch["view"];
  set: SetSearch;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs">
          {VIEW_LABELS[view]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {TASK_VIEW_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => set({ view: opt })}>
            {VIEW_LABELS[opt]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

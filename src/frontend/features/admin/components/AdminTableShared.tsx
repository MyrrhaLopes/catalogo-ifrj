import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/frontend/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { Button, buttonVariants } from "@/frontend/components/ui/button";
import { AlertTriangle, Loader2, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LockedCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <Lock className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}

export function CreatedAtCell({
  value,
  className,
}: {
  value: string | Date | null | undefined;
  className?: string;
}) {
  if (!value) return <LockedCell className={className}>—</LockedCell>;
  return <LockedCell className={className}>{new Date(value).toLocaleDateString("pt-BR")}</LockedCell>;
}

type ConfirmDeleteOutlineProps = {
  title: string;
  description: React.ReactNode;
  isPending?: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteButton({
  title,
  description,
  isPending,
  onConfirm,
}: ConfirmDeleteOutlineProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/40 hover:bg-red-500 hover:text-white hover:border-red-500"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ConfirmDeleteIconButtonProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  buttonClassName?: string;
  iconClassName?: string;
  buttonTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmDeleteIconButton({
  title,
  description = "Esta ação não pode ser desfeita.",
  confirmLabel = "Excluir",
  buttonClassName = "h-7 w-7 text-destructive hover:text-destructive",
  iconClassName = "h-3.5 w-3.5",
  buttonTitle,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteIconButtonProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className={buttonClassName} title={buttonTitle}>
          <Trash2 className={iconClassName} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => {
              onOpenChange?.(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type FullScreenDeleteWarningProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: string[];
  isLoadingImpact?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
};

// Aviso em tela cheia para exclusões em cascata — mais difícil de ignorar que o AlertDialog
// padrão, usado quando a exclusão também vai apagar/desvincular outros registros.
export function FullScreenDeleteWarning({
  open,
  onOpenChange,
  title,
  items,
  isLoadingImpact,
  isPending,
  onConfirm,
}: FullScreenDeleteWarningProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none sm:rounded-none flex flex-col items-center justify-center gap-6 bg-destructive/5">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-base text-center">
              {isLoadingImpact
                ? "Verificando o que será afetado…"
                : "Esta ação não pode ser desfeita. Isso também vai:"}
            </DialogDescription>
          </DialogHeader>
          {!isLoadingImpact && items.length > 0 && (
            <ul className="text-sm space-y-1.5 border rounded-md p-3 bg-background w-full text-left">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {!isLoadingImpact && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum outro registro será afetado.</p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="lg"
            disabled={isLoadingImpact || isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Excluir mesmo assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type RenderableTable<
  TData extends { id: number | string },
  THeader extends { id: string; isPlaceholder: boolean },
  TCell extends { id: string },
> = {
  getHeaderGroups: () => Array<{
    id: string;
    headers: THeader[];
  }>;
  getRowModel: () => {
    rows: Array<{
      id: string;
      original: TData;
      getAllCells: () => TCell[];
    }>;
  };
  FlexRender: (props: { header: THeader } | { cell: TCell }) => React.ReactNode;
};

type AdminDataTableProps<
  TData extends { id: number | string },
  THeader extends { id: string; isPlaceholder: boolean },
  TCell extends { id: string },
> = {
  table: RenderableTable<TData, THeader, TCell>;
  colCount: number;
  emptyMessage: string;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  errorMessage?: string;
  selectedId?: number | string;
  clearSection?: "species" | "specimen";
  data?: TData[];
};

function useSelectedRowHighlight<TData>(
  selectedId: number | string | undefined,
  clearSection: "species" | "specimen" | undefined,
  data: TData[] | undefined,
) {
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedId != null && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedId, data]);

  useEffect(() => {
    if (selectedId == null || !clearSection) return;

    const clear = () =>
      void navigate({ to: "/admin", search: { section: clearSection } });

    const timer = setTimeout(clear, 2000);

    function handleClick(e: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        clear();
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [selectedId, clearSection, navigate]);

  return { selectedRowRef, tableRef };
}

export function AdminDataTable<
  TData extends { id: number | string },
  THeader extends { id: string; isPlaceholder: boolean },
  TCell extends { id: string },
>({
  table,
  colCount,
  emptyMessage,
  isLoading,
  loadingMessage = "Carregando…",
  isError,
  errorMessage = "Erro ao carregar dados.",
  selectedId,
  clearSection,
  data,
}: AdminDataTableProps<TData, THeader, TCell>) {
  const { selectedRowRef, tableRef } = useSelectedRowHighlight(selectedId, clearSection, data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {loadingMessage}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive text-sm p-4">{errorMessage}</div>;
  }

  const rows = table.getRowModel().rows;

  return (
    <div ref={tableRef} className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const isSelected = selectedId != null && row.original.id === selectedId;
              return (
                <TableRow
                  key={row.id}
                  ref={isSelected ? selectedRowRef : undefined}
                  className={cn(isSelected && "bg-primary/10 ring-1 ring-inset ring-primary")}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

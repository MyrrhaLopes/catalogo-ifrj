import { useEffect, useRef, useState } from "react";
import { tableFeatures, createColumnHelper, useTable } from "@tanstack/react-table";
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
import { Button, buttonVariants } from "@/frontend/components/ui/button";
import { ImageIcon, Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useImagesList, useDeleteImage, useUpdateImage } from "../hooks/useAdminImages";
import { CreateImageModal } from "./CreateImageModal";
import type { GalleryImage } from "@/frontend/features/images/images.api";

// ── AltTextCell ─────────────────────────────────────────────────────
// Floating textarea that uses position:fixed to escape table overflow-auto.
// The display span always stays in place (holds cell dimensions); the textarea
// is anchored to the span's viewport rect so it doesn't shift the layout.

function AltTextCell({ image }: { image: GalleryImage }) {
  const updateMutation = useUpdateImage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(image.alt ?? "");
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft when image.alt changes externally (after save)
  useEffect(() => {
    if (!editing) setDraft(image.alt ?? "");
  }, [image.alt, editing]);

  function startEdit() {
    const rect = displayRef.current?.getBoundingClientRect();
    setAnchor(rect ? { top: rect.top, left: rect.left } : null);
    setDraft(image.alt ?? "");
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim() || null;
    if (trimmed === image.alt) return;
    updateMutation.mutate({ id: image.id, data: { alt: trimmed } });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setDraft(image.alt ?? "");
      setEditing(false);
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commit();
    }
  }

  return (
    <>
      {/* Display — always rendered; invisible while editing so cell keeps its size */}
      <span
        ref={displayRef}
        onClick={startEdit}
        title={image.alt ?? "Clique para editar"}
        className={`group flex items-center gap-1 cursor-pointer rounded border border-input px-1 py-0.5 text-xs transition-colors hover:bg-muted max-w-[200px] ${
          editing ? "invisible" : ""
        }`}
      >
        <span className="truncate text-muted-foreground">{image.alt ?? "—"}</span>
        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
      </span>

      {/* Floating textarea — fixed to viewport, bypasses overflow-auto */}
      {editing && anchor && (
        <div
          className="fixed z-50 rounded-md border border-ring bg-background shadow-xl ring-2 ring-ring/30 overflow-hidden"
          style={{ top: anchor.top, left: anchor.left, width: 300 }}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Descrição da imagem..."
            className="block w-full max-h-48 resize-none overflow-y-auto px-2 py-1.5 text-xs outline-none bg-transparent placeholder:text-muted-foreground"
            style={{ wordBreak: "break-word" }}
          />
          <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-t border-border">
            <span className="text-[10px] text-muted-foreground">Ctrl+Enter salvar · Esc cancelar</span>
            {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, GalleryImage>();

function DeleteCell({ image }: { image: GalleryImage }) {
  const deleteMutation = useDeleteImage();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => { setOpen(false); deleteMutation.mutate(image.id); }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "preview",
    header: "",
    cell: (ctx) => {
      const src = ctx.row.original.url;
      return (
        <div className="h-10 w-10 rounded overflow-hidden border border-input shrink-0">
          {src ? (
            <img src={src} alt={ctx.row.original.alt ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: (ctx) => (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Lock className="h-3 w-3 shrink-0" />
        {ctx.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("url", {
    header: "URL",
    cell: (ctx) => (
      <a
        href={ctx.getValue()}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-primary hover:underline max-w-[240px] truncate block"
        title={ctx.getValue()}
      >
        {ctx.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("alt", {
    header: "Descrição",
    cell: (ctx) => <AltTextCell image={ctx.row.original} />,
  }),
  columnHelper.accessor("createdAt", {
    header: "Adicionada em",
    cell: (ctx) => (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Lock className="h-3 w-3 shrink-0" />
        {new Date(ctx.getValue()).toLocaleDateString("pt-BR")}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (ctx) => <DeleteCell image={ctx.row.original} />,
  }),
]);

export function ImagesTable() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: images = [], isLoading } = useImagesList();

  const table = useTable({
    features,
    data: images,
    columns,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando imagens…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Imagens da galeria</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar imagem
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : <table.FlexRender header={h} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground text-sm py-8">
                  Nenhuma imagem cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateImageModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

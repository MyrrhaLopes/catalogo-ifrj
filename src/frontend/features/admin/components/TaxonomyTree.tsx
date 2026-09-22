import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  MeasuringStrategy,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, Plus, GripVertical, Loader2, Check, X, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { useTaxonomy } from "@/frontend/features/species/hooks/useTaxonomy";
import { useUpdateTaxonomyNodeParent, useCreateTaxonomyNode, useUpdateTaxonomyNodeLabel, useDeleteTaxonomyNode } from "../hooks/useAdminTaxonomy";
import { getTaxonomyAffectedSpecies, type AffectedSpeciesItem } from "../admin.api";
import type { TaxonomyNode } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { cn } from "@/frontend/shared/utils";

export type DraftTaxonomyNode = {
  tempId: number;     // always negative
  label: string;
  labelValue: string;
  parentId: number;   // positive = real node ID; negative = another draft's tempId; === tempId means root
};

type TreeNode = TaxonomyNode & { children: TreeNode[] };

function buildTree(nodes: TaxonomyNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));

  const roots: TreeNode[] = [];
  nodes.forEach((n) => {
    const node = map.get(n.id)!;
    if (n.parent === n.id) {
      roots.push(node);
    } else {
      const parent = map.get(n.parent);
      if (parent) parent.children.push(node);
    }
  });
  return roots;
}

// zoneId uniquely identifies each insert zone:
//   "top"         → before all roots
//   "parent-{id}" → between node {id} and its children
//   "bottom"      → after all roots
// parentId === 0 signals "create as root"
type ActiveInsert = {
  zoneId: string;
  parentId: number;
};

type InsertZoneContext = {
  activeInsert: ActiveInsert | null;
  insertLabel: string;
  insertLabelValue: string;
  onLabelChange: (v: string) => void;
  onLabelValueChange: (v: string) => void;
  onActivate: (zoneId: string, parentId: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  createdNodeId: number | null;
  draftIds: Set<number>;
};

function InsertZone({
  zoneId,
  parentId,
  ctx,
}: {
  zoneId: string;
  parentId: number;
  ctx: InsertZoneContext;
}) {
  const isActive = ctx.activeInsert?.zoneId === zoneId;

  if (isActive) {
    return (
      <div className="my-1 p-2 border border-dashed border-green-500 rounded-md bg-background flex flex-col gap-2 text-sm">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">Nível (ex: Subclasse)</Label>
            <Input
              value={ctx.insertLabel}
              onChange={(e) => ctx.onLabelChange(e.target.value)}
              placeholder="ex: Subclasse"
              className="h-7 text-xs"
              autoFocus
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Valor (ex: teleostei)</Label>
            <Input
              value={ctx.insertLabelValue}
              onChange={(e) => ctx.onLabelValueChange(e.target.value)}
              placeholder="ex: teleostei"
              className="h-7 text-xs"
            />
          </div>
        </div>
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={ctx.onCancel} className="h-6 px-2">
            <X className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            onClick={ctx.onConfirm}
            disabled={!ctx.insertLabel || !ctx.insertLabelValue}
            className="h-6 px-2"
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative h-2 cursor-pointer flex items-center"
      onClick={() => ctx.onActivate(zoneId, parentId)}
    >
      <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-green-500 transition-opacity rounded-full" />
      <Plus className="absolute right-0.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white bg-green-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    </div>
  );
}

type InsertTreeNodeProps = {
  node: TreeNode;
  selectedId?: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelect: (node: { id: number; label: string; labelValue: string }) => void;
  ctx: InsertZoneContext;
};

function InsertTreeNode({ node, selectedId, expandedIds, onToggle, onSelect, ctx }: InsertTreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;
  const isCreated = node.id === ctx.createdNodeId;
  const isDraft = ctx.draftIds.has(node.id);
  const isExpandable = hasChildren || isDraft;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: node.id,
    disabled: !isCreated,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `insert-drop-${node.id}`,
    disabled: isCreated,
  });

  const style = isCreated && transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div ref={setDropRef}>
      <div
        ref={setDragRef}
        style={style}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-muted/60 text-sm",
          isSelected && "bg-primary/10 font-medium text-primary",
          isDragging && "opacity-40",
          isOver && !isCreated && "bg-primary/10 ring-1 ring-primary",
        )}
        onClick={() => {
          onSelect({ id: node.id, label: node.label, labelValue: node.labelValue });
          if (isExpandable) onToggle(node.id);
        }}
      >
        {isCreated && (
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground hover:text-foreground p-0.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3" />
          </span>
        )}
        <span className="p-0 w-4 h-4 flex items-center justify-center shrink-0">
          {isExpandable ? (
            isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
          ) : (
            <span className="w-3" />
          )}
        </span>
        <span className={cn("text-xs mr-1", isDraft ? "text-green-600" : "text-muted-foreground")}>
          {node.label}
        </span>
        <span className={cn(isDraft && "italic")}>{node.labelValue}</span>
        {isDraft && <span className="ml-1 text-[10px] text-green-600 font-medium">novo</span>}
      </div>
      {isExpanded && isExpandable && (
        <div className="ml-4 border-l pl-2">
          <InsertZone zoneId={`parent-${node.id}`} parentId={node.id} ctx={ctx} />
          {node.children.map((child) => (
            <InsertTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              ctx={ctx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DraggableNodeProps = {
  node: TreeNode;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  activeId: number | null;
};

function DraggableNode({ node, expandedIds, onToggle, activeId }: DraggableNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: node.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `drop-${node.id}` });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div ref={setDropRef}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-sm",
          isDragging && "opacity-40",
          isOver && activeId !== node.id && "bg-primary/10 ring-1 ring-primary",
        )}
      >
        <span {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-0.5">
          <GripVertical className="h-3 w-3" />
        </span>
        <button
          className="p-0 w-4 h-4 flex items-center justify-center shrink-0"
          onClick={() => hasChildren && onToggle(node.id)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
          ) : (
            <span className="w-3" />
          )}
        </button>
        <span className="text-xs text-muted-foreground mr-1">{node.label}</span>
        <span>{node.labelValue}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4 border-l pl-2">
          {node.children.map((child) => (
            <DraggableNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DeletePhase =
  | null
  | "loading"
  | "inline"
  | { affectedSpecies: AffectedSpeciesItem[] };

type ManageTreeNodeProps = {
  node: TreeNode;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  activeId: number | null;
  ctx: InsertZoneContext;
};

function ManageTreeNode({ node, expandedIds, onToggle, activeId, ctx }: ManageTreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  const [editState, setEditState] = useState<{ label: string; labelValue: string } | null>(null);
  const [deletePhase, setDeletePhase] = useState<DeletePhase>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: node.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `drop-${node.id}` });
  const updateLabel = useUpdateTaxonomyNodeLabel();
  const deleteNode = useDeleteTaxonomyNode();

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  async function handleTrashClick() {
    setDeletePhase("loading");
    try {
      const species = await getTaxonomyAffectedSpecies(node.id);
      setDeletePhase(species.length > 0 ? { affectedSpecies: species } : "inline");
    } catch {
      setDeletePhase("inline");
    }
  }

  const isModalOpen = typeof deletePhase === "object" && deletePhase !== null;

  return (
    <div ref={setDropRef}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-sm group",
          isDragging && "opacity-40",
          isOver && activeId !== node.id && "bg-primary/10 ring-1 ring-primary",
        )}
      >
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground p-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </span>
        <button
          className="p-0 w-4 h-4 flex items-center justify-center shrink-0"
          onClick={() => onToggle(node.id)}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {editState ? (
          <>
            <Input
              value={editState.label}
              onChange={(e) => setEditState({ ...editState, label: e.target.value })}
              className="h-6 text-xs flex-1 min-w-0"
              autoFocus
            />
            <Input
              value={editState.labelValue}
              onChange={(e) => setEditState({ ...editState, labelValue: e.target.value })}
              className="h-6 text-xs flex-1 min-w-0"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              disabled={!editState.label || !editState.labelValue || updateLabel.isPending}
              onClick={async () => {
                await updateLabel.mutateAsync({ nodeId: node.id, label: editState.label, labelValue: editState.labelValue });
                setEditState(null);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setEditState(null)}>
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground mr-0.5 shrink-0">{node.label}:</span>
            <span className="flex-1 truncate">{node.labelValue}</span>

            {deletePhase === "loading" ? (
              <Loader2 className="h-3 w-3 animate-spin ml-1 shrink-0 text-muted-foreground" />
            ) : deletePhase === "inline" ? (
              <div className="flex items-center gap-1 ml-1 shrink-0">
                <span className="text-xs text-destructive font-medium">Excluir?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-5 px-2 text-[10px]"
                  disabled={deleteNode.isPending}
                  onClick={() => void deleteNode.mutateAsync(node.id).catch(() => setDeletePhase(null))}
                >
                  Sim
                </Button>
                <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px]" onClick={() => setDeletePhase(null)}>
                  Não
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => { setEditState({ label: node.label, labelValue: node.labelValue }); }}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-destructive hover:text-destructive"
                  onClick={() => void handleTrashClick()}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmação quando há espécies afetadas */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setDeletePhase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              {isModalOpen && `Excluir "${node.labelValue}" também apagará ${(deletePhase as { affectedSpecies: AffectedSpeciesItem[] }).affectedSpecies.length} espécie(s) vinculada(s):`}
            </DialogDescription>
          </DialogHeader>
          {isModalOpen && (
            <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
              {(deletePhase as { affectedSpecies: AffectedSpeciesItem[] }).affectedSpecies.map((sp) => (
                <li key={sp.id} className="flex items-center gap-2 py-0.5">
                  <span className="text-muted-foreground text-xs shrink-0">#{sp.id}</span>
                  <span className="italic">{sp.speciesName}</span>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletePhase(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteNode.isPending}
              onClick={() => void deleteNode.mutateAsync(node.id).catch(() => setDeletePhase(null))}
            >
              Excluir mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isExpanded && (
        <div className="ml-4 border-l pl-2">
          <InsertZone zoneId={`parent-${node.id}`} parentId={node.id} ctx={ctx} />
          {hasChildren && node.children.map((child) => (
            <ManageTreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              activeId={activeId}
              ctx={ctx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type TaxonomyTreeProps =
  | {
      variant: "new";
      selectedNodeId?: number;
      onSelect: (node: { id: number; label: string; labelValue: string }) => void;
      onDraftNodesChange: (nodes: DraftTaxonomyNode[]) => void;
    }
  | {
      variant: "reorder";
      selectedNodeId?: undefined;
      onSelect?: undefined;
      onDraftNodesChange?: undefined;
    }
  | {
      variant: "manage";
      selectedNodeId?: undefined;
      onSelect?: undefined;
      onDraftNodesChange?: undefined;
    };

export function TaxonomyTree(props: TaxonomyTreeProps) {
  const { data: nodes = [], isLoading } = useTaxonomy();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeInsert, setActiveInsert] = useState<ActiveInsert | null>(null);
  const [insertLabel, setInsertLabel] = useState("");
  const [insertLabelValue, setInsertLabelValue] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [insertActiveId, setInsertActiveId] = useState<number | null>(null);
  const [createdNodeId, setCreatedNodeId] = useState<number | null>(null);
  const [draftNodes, setDraftNodes] = useState<DraftTaxonomyNode[]>([]);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const nextTempId = useRef(-1);

  const updateParent = useUpdateTaxonomyNodeParent();
  const createNode = useCreateTaxonomyNode();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const draftAsNodes: TaxonomyNode[] = draftNodes.map((d) => ({
    id: d.tempId,
    label: d.label,
    labelValue: d.labelValue,
    parent: d.parentId,
  }));
  const allNodes = [...nodes, ...draftAsNodes];
  const tree = buildTree(allNodes);
  const draftIds = new Set(draftNodes.map((d) => d.tempId));

  useEffect(() => {
    if (props.variant === "new") {
      props.onDraftNodesChange(draftNodes);
    }
  }, [draftNodes]);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleInsert() {
    if (!activeInsert) return;
    const newTempId = nextTempId.current--;
    const isRoot = activeInsert.parentId === 0;
    const newDraft: DraftTaxonomyNode = {
      tempId: newTempId,
      label: insertLabel,
      labelValue: insertLabelValue,
      parentId: isRoot ? newTempId : activeInsert.parentId,
    };
    setDraftNodes((prev) => [...prev, newDraft]);
    setCreatedNodeId(newTempId);
    if (!isRoot) {
      setExpandedIds((prev) => new Set([...prev, activeInsert.parentId]));
    }
    if (props.variant === "new") {
      props.onSelect({ id: newTempId, label: insertLabel, labelValue: insertLabelValue });
    }
    setActiveInsert(null);
    setInsertLabel("");
    setInsertLabelValue("");
  }

  async function handleManageInsert() {
    if (!activeInsert) return;
    const isRoot = activeInsert.parentId === 0;
    setActiveInsert(null);
    setInsertLabel("");
    setInsertLabelValue("");
    await createNode.mutateAsync({
      label: insertLabel,
      labelValue: insertLabelValue,
      parentId: isRoot ? null : activeInsert.parentId,
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const draggedId = active.id as number;
    const overDropId = String(over.id);
    if (!overDropId.startsWith("drop-")) return;
    const targetId = Number(overDropId.replace("drop-", ""));
    if (draggedId === targetId) return;
    try {
      await updateParent.mutateAsync({ nodeId: draggedId, newParentId: targetId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao mover nó";
      setReorderError(msg);
      setTimeout(() => setReorderError(null), 4000);
    }
  }

  function handleInsertDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setInsertActiveId(null);
    if (!over) return;
    const draggedId = active.id as number;
    const overDropId = String(over.id);
    if (!overDropId.startsWith("insert-drop-")) return;
    const targetId = Number(overDropId.replace("insert-drop-", ""));
    if (draggedId === targetId) return;
    setDraftNodes((prev) =>
      prev.map((d) => (d.tempId === draggedId ? { ...d, parentId: targetId } : d)),
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando taxonomia…
      </div>
    );
  }

  if (props.variant === "new") {
    const ctx: InsertZoneContext = {
      activeInsert,
      insertLabel,
      insertLabelValue,
      onLabelChange: setInsertLabel,
      onLabelValueChange: setInsertLabelValue,
      onActivate: (zoneId, parentId) => setActiveInsert({ zoneId, parentId }),
      onCancel: () => setActiveInsert(null),
      onConfirm: handleInsert,
      createdNodeId,
      draftIds,
    };

    const insertDragOverlayNode = insertActiveId ? allNodes.find((n) => n.id === insertActiveId) : null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={(e) => setInsertActiveId(e.active.id as number)}
        onDragEnd={handleInsertDragEnd}
      >
        <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>
          <InsertZone zoneId="top" parentId={0} ctx={ctx} />
          {tree.map((root) => (
            <InsertTreeNode
              key={root.id}
              node={root}
              selectedId={props.selectedNodeId}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              onSelect={props.onSelect}
              ctx={ctx}
            />
          ))}
          <InsertZone zoneId="bottom" parentId={0} ctx={ctx} />
        </div>
        <DragOverlay>
          {insertDragOverlayNode && (
            <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-green-600">{insertDragOverlayNode.label}:</span>
              <span className="italic">{insertDragOverlayNode.labelValue}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    );
  }

  if (props.variant === "manage") {
    const ctx: InsertZoneContext = {
      activeInsert,
      insertLabel,
      insertLabelValue,
      onLabelChange: setInsertLabel,
      onLabelValueChange: setInsertLabelValue,
      onActivate: (zoneId, parentId) => setActiveInsert({ zoneId, parentId }),
      onCancel: () => setActiveInsert(null),
      onConfirm: () => void handleManageInsert(),
      createdNodeId: null,
      draftIds: new Set(),
    };

    const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={(e) => setActiveId(e.active.id as number)}
        onDragEnd={handleDragEnd}
      >
        <div className="border rounded-md p-2 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>
          {reorderError && (
            <p className="text-xs text-destructive flex items-center gap-1 mb-1 px-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {reorderError}
            </p>
          )}
          <InsertZone zoneId="top" parentId={0} ctx={ctx} />
          {tree.map((root) => (
            <ManageTreeNode
              key={root.id}
              node={root}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              activeId={activeId}
              ctx={ctx}
            />
          ))}
          <InsertZone zoneId="bottom" parentId={0} ctx={ctx} />
        </div>
        <DragOverlay>
          {activeNode && (
            <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{activeNode.label}:</span>
              <span>{activeNode.labelValue}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    );
  }

  // reorder variant
  const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={(e) => setActiveId(e.active.id as number)}
      onDragEnd={handleDragEnd}
    >
      <div className="border rounded-md p-2 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>
        {reorderError && (
          <p className="text-xs text-destructive flex items-center gap-1 mb-1 px-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {reorderError}
          </p>
        )}
        {tree.map((root) => (
          <DraggableNode
            key={root.id}
            node={root}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            activeId={activeId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeNode && (
          <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{activeNode.label}:</span>
            <span>{activeNode.labelValue}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

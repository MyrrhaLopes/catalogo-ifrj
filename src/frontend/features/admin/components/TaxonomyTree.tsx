import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, Plus, GripVertical, Loader2, Check, X } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { useTaxonomy } from "@/frontend/features/species/hooks/useTaxonomy";
import { useCreateTaxonomyNode, useUpdateTaxonomyNodeParent } from "../hooks/useAdminTaxonomy";
import type { TaxonomyNode } from "@/backend/http/features/taxonomy/taxonomy.schema";
import { cn } from "@/frontend/shared/utils";

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

function getPath(nodes: TaxonomyNode[], targetId: number): TaxonomyNode[] {
  const map = new Map<number, TaxonomyNode>();
  nodes.forEach((n) => map.set(n.id, n));

  const path: TaxonomyNode[] = [];
  let current = map.get(targetId);
  while (current) {
    path.unshift(current);
    if (current.parent === current.id) break;
    current = map.get(current.parent);
  }
  return path;
}

type InsertFormProps = {
  parentId: number;
  childId: number;
  onConfirm: (label: string, labelValue: string) => void;
  onCancel: () => void;
  isPending: boolean;
};

function InsertForm({ parentId: _parentId, childId: _childId, onConfirm, onCancel, isPending }: InsertFormProps) {
  const [label, setLabel] = useState("");
  const [labelValue, setLabelValue] = useState("");

  return (
    <div className="my-1 mx-2 p-2 border border-dashed rounded-md bg-background flex flex-col gap-2 text-sm">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs">Nível (ex: Subclasse)</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex: Subclasse"
            className="h-7 text-xs"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs">Valor (ex: teleostei)</Label>
          <Input
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            placeholder="ex: teleostei"
            className="h-7 text-xs"
          />
        </div>
      </div>
      <div className="flex gap-1 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending} className="h-6 px-2">
          <X className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={() => onConfirm(label, labelValue)}
          disabled={!label || !labelValue || isPending}
          className="h-6 px-2"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

type SelectTreeNodeProps = {
  node: TreeNode;
  selectedId?: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelect: (node: TaxonomyNode) => void;
};

function SelectTreeNode({ node, selectedId, expandedIds, onToggle, onSelect }: SelectTreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-muted/60 text-sm",
          isSelected && "bg-primary/10 font-medium text-primary",
        )}
        onClick={() => onSelect(node)}
      >
        <button
          className="p-0 w-4 h-4 flex items-center justify-center shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
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
            <SelectTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
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

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
  });

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
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground p-0.5"
        >
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

export type TaxonomyTreeProps =
  | {
      variant: "select";
      selectedNodeId?: number;
      onSelect: (node: TaxonomyNode) => void;
    }
  | {
      variant: "edit";
      selectedNodeId?: undefined;
      onSelect?: undefined;
    };

export function TaxonomyTree(props: TaxonomyTreeProps) {
  const { data: nodes = [], isLoading } = useTaxonomy();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [insertingBetween, setInsertingBetween] = useState<{ parentId: number; childId: number } | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const createNode = useCreateTaxonomyNode();
  const updateParent = useUpdateTaxonomyNodeParent();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tree = buildTree(nodes);
  const path =
    props.variant === "select" && props.selectedNodeId !== undefined
      ? getPath(nodes, props.selectedNodeId)
      : [];

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleInsertBetween(label: string, labelValue: string) {
    if (!insertingBetween) return;
    const { parentId, childId } = insertingBetween;
    try {
      const newNode = await createNode.mutateAsync({ label, labelValue, parentId });
      await updateParent.mutateAsync({ nodeId: childId, newParentId: newNode.id });
      setInsertingBetween(null);
    } catch {
      // errors surfaced via mutation state
    }
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
    await updateParent.mutateAsync({ nodeId: draggedId, newParentId: targetId });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando taxonomia…
      </div>
    );
  }

  if (props.variant === "select") {
    return (
      <div className="flex flex-col gap-2">
        {path.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Caminho selecionado</p>
            {path.map((node, idx) => (
              <div key={node.id}>
                <div className="flex items-center gap-1 text-sm bg-muted/40 rounded px-2 py-1">
                  <span className="text-xs text-muted-foreground">{node.label}:</span>
                  <span className="font-medium">{node.labelValue}</span>
                </div>
                {idx < path.length - 1 && (
                  <>
                    {insertingBetween?.parentId === node.id &&
                    insertingBetween?.childId === path[idx + 1].id ? (
                      <InsertForm
                        parentId={node.id}
                        childId={path[idx + 1].id}
                        onConfirm={handleInsertBetween}
                        onCancel={() => setInsertingBetween(null)}
                        isPending={createNode.isPending || updateParent.isPending}
                      />
                    ) : (
                      <div className="flex justify-center my-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={() =>
                            setInsertingBetween({ parentId: node.id, childId: path[idx + 1].id })
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          inserir nível
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>
          {tree.map((root) => (
            <SelectTreeNode
              key={root.id}
              node={root}
              selectedId={props.selectedNodeId}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              onSelect={props.onSelect}
            />
          ))}
        </div>
      </div>
    );
  }

  const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id as number)}
      onDragEnd={handleDragEnd}
    >
      <div className="border rounded-md p-2 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Árvore taxonômica</p>
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

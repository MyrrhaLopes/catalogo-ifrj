import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { ArticleEditorSection } from "./editor/ArticleEditorSection";
import { useArticleEditor, type SectionKey, type DraftSections } from "@/frontend/features/article/hooks/useArticleEditor";

type ArticleEditControllerProps = {
  id: string;
  editor: ReturnType<typeof useArticleEditor>;
};

export function ArticleEditController({ id, editor }: ArticleEditControllerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function findContainer(itemId: string): SectionKey | null {
    if (itemId === "left" || itemId === "center" || itemId === "right") return itemId as SectionKey;
    for (const key of ["left", "center", "right"] as SectionKey[]) {
      if (editor.sections[key].some((item) => item.id === itemId)) return key;
    }
    return null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    const fromContainer = findContainer(aId);
    const toContainer = findContainer(oId);
    if (!fromContainer || !toContainer || fromContainer === toContainer) return;
    editor.setSections((prev: DraftSections) => {
      const fromItems = [...prev[fromContainer]];
      const toItems = [...prev[toContainer]];
      const fromIdx = fromItems.findIndex((i) => i.id === aId);
      if (fromIdx < 0) return prev;
      const toIdx = toItems.findIndex((i) => i.id === oId);
      const [item] = fromItems.splice(fromIdx, 1);
      const insertAt = toIdx >= 0 ? toIdx : toItems.length;
      return { ...prev, [fromContainer]: fromItems, [toContainer]: [...toItems.slice(0, insertAt), item, ...toItems.slice(insertAt)] };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    const fromContainer = findContainer(aId);
    const toContainer = findContainer(oId);
    if (!fromContainer || !toContainer || fromContainer !== toContainer) return;
    const fromIdx = editor.sections[fromContainer].findIndex((i) => i.id === aId);
    const toIdx = editor.sections[toContainer].findIndex((i) => i.id === oId);
    if (fromIdx !== toIdx) {
      editor.setSections((prev: DraftSections) => ({
        ...prev,
        [fromContainer]: arrayMove(prev[fromContainer], fromIdx, toIdx),
      }));
    }
  }

  const activeItem = activeId
    ? (["left", "center", "right"] as SectionKey[]).flatMap((key) => editor.sections[key]).find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
        <aside className="w-44 shrink-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Esquerda</p>
          <ArticleEditorSection sectionKey="left" speciesId={Number(id)} items={editor.sections.left} onAdd={(i, item) => editor.addItem("left", i, item)} onRemove={(itemId) => editor.removeItem("left", itemId)} onUpdate={(itemId, block) => editor.updateBlockContent("left", itemId, block)} onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)} />
        </aside>
        <article className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Centro</p>
          <ArticleEditorSection sectionKey="center" speciesId={Number(id)} items={editor.sections.center} onAdd={(i, item) => editor.addItem("center", i, item)} onRemove={(itemId) => editor.removeItem("center", itemId)} onUpdate={(itemId, block) => editor.updateBlockContent("center", itemId, block)} onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)} />
        </article>
        <aside className="w-52 shrink-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Direita</p>
          <ArticleEditorSection sectionKey="right" speciesId={Number(id)} items={editor.sections.right} onAdd={(i, item) => editor.addItem("right", i, item)} onRemove={(itemId) => editor.removeItem("right", itemId)} onUpdate={(itemId, block) => editor.updateBlockContent("right", itemId, block)} onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)} />
        </aside>
      </div>
      <DragOverlay>
        {activeItem && (
          <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            {activeItem.kind === "default"
              ? <span className="text-xs text-muted-foreground">{activeItem.name}</span>
              : <span className="text-xs text-muted-foreground capitalize">{activeItem.block.type}</span>
            }
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

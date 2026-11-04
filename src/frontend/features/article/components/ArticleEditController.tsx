import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { ArticleEditorSection } from "./editor/ArticleEditorSection";
import { findItemLocation } from "./editor/draftTree";
import { createEditorCollisionDetection } from "./editor/editorCollision";
import {
  useArticleEditor,
  type DraftItem,
  type SectionKey,
} from "@/frontend/features/article/hooks/useArticleEditor";

type ArticleEditControllerProps = {
  id: string;
  editor: ReturnType<typeof useArticleEditor>;
};

const SECTION_LAYOUT: { key: SectionKey; label: string; className: string }[] = [
  { key: "left", label: "Esquerda", className: "lg:w-44 lg:shrink-0" },
  { key: "center", label: "Centro", className: "min-w-0 lg:flex-1" },
  { key: "right", label: "Direita", className: "lg:w-52 lg:shrink-0" },
];

export function ArticleEditController({ id, editor }: ArticleEditControllerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Recriada a cada render para sempre enxergar o estado mais recente das seções.
  const collisionDetection = createEditorCollisionDetection(() => editor.sections);

  function handleDragOver(event: DragOverEvent) {
    if (!event.over) return;
    editor.moveItem(String(event.active.id), String(event.over.id), "over");
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!event.over) return;
    editor.moveItem(String(event.active.id), String(event.over.id), "end");
  }

  const activeItem = activeId ? findItemLocation(editor.sections, activeId)?.item ?? null : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-6 sm:px-6 md:px-8 lg:flex-row lg:gap-10 lg:px-10 lg:py-10">
        {SECTION_LAYOUT.map(({ key, label, className }) => (
          <div key={key} className={className}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
            <ArticleEditorSection
              sectionKey={key}
              speciesId={Number(id)}
              items={editor.sections[key]}
              onAdd={(i, item) => editor.addItem(key, i, item)}
              onRemove={(itemId) => editor.removeItem(key, itemId)}
              onUpdate={(itemId, next) => editor.updateItem(key, itemId, next)}
              onToggleDefault={(itemId) => editor.toggleDefaultBlock(itemId)}
              onDeleteNestedBlock={(block) => editor.trackDeletedBlock(block)}
            />
          </div>
        ))}
      </div>
      <DragOverlay>{activeItem && <DragPreview item={activeItem} />}</DragOverlay>
    </DndContext>
  );
}

function DragPreview({ item }: { item: DraftItem }) {
  const label = item.kind === "default" ? item.name : item.kind === "column" ? "column" : item.block.type;
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded text-sm bg-background border shadow-md">
      <GripVertical className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground capitalize">{label}</span>
    </div>
  );
}

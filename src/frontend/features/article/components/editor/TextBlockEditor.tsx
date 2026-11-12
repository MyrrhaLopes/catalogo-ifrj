import type { TextBlock } from "../types";
import { useTextBlockEditor } from "../../hooks/useTextBlockEditor";
import { TextFormatToolbar } from "./TextFormatToolbar";

type Props = {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
};

export function TextBlockEditor({ block, onChange }: Props) {
  const {
    textareaRef,
    showToolbar,
    popoverOpen,
    citationUrl,
    isCiting,
    setCitationUrl,
    checkSelection,
    handlePopoverOpenChange,
    handleCite,
    handleTextareaClick,
    handleBold,
    handleItalic,
  } = useTextBlockEditor({ block, onChange });

  return (
    <div className="relative">
      {(showToolbar || popoverOpen) && (
        <TextFormatToolbar
          onBold={handleBold}
          onItalic={handleItalic}
          citeOpen={popoverOpen}
          onCiteOpenChange={handlePopoverOpenChange}
          citeUrl={citationUrl}
          onCiteUrlChange={setCitationUrl}
          onCiteSubmit={() => void handleCite()}
          isCiting={isCiting}
        />
      )}
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange({ type: "text", content: e.target.value })}
        onMouseUp={checkSelection}
        onKeyUp={checkSelection}
        onClick={handleTextareaClick}
        placeholder="Texto (suporta markdown: # Título, ## Subtítulo, **negrito**, *itálico*, parágrafos…)"
        className="w-full resize-none overflow-hidden rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono min-h-[80px]"
        rows={3}
      />
    </div>
  );
}

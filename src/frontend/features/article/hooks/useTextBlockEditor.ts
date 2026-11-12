import { useRef, useEffect, useState, useCallback } from "react";
import type { TextBlock } from "../components/types";

type Params = {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
};

export function useTextBlockEditor({ block, onChange }: Params) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Saved cursor position where the citation marker will be inserted.
  // Stored in a ref so it survives the textarea losing focus when user
  // clicks the citation button or types in the URL input.
  const insertionPointRef = useRef<number | null>(null);

  const [showToolbar, setShowToolbar] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [citationUrl, setCitationUrl] = useState("");
  const [isCiting, setIsCiting] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.content]);

  const checkSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (el.selectionStart !== el.selectionEnd) {
      // Save the END of the selection as the insertion point for the citation marker.
      insertionPointRef.current = el.selectionEnd;
      setShowToolbar(true);
    }
  }, []);

  // When popover closes without inserting, re-check whether the textarea
  // still has a selection so the toolbar visibility stays correct.
  function handlePopoverOpenChange(open: boolean) {
    setPopoverOpen(open);
    if (!open) {
      setCitationUrl("");
      const el = textareaRef.current;
      const stillSelected =
        el != null && document.activeElement === el && el.selectionStart !== el.selectionEnd;
      if (!stillSelected) {
        setShowToolbar(false);
        insertionPointRef.current = null;
      }
    }
  }

  async function handleCite() {
    const pos = insertionPointRef.current;
    if (pos === null || !citationUrl.trim()) return;

    const url = citationUrl.trim();
    setIsCiting(true);
    try {
      const res = await fetch("/api/v1/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Falha ao salvar fonte");
      const { source } = (await res.json()) as { source: { id: number } };
      const { id } = source;
      const marker = `[cite:${id}]`;
      const newContent = block.content.slice(0, pos) + marker + block.content.slice(pos);
      onChange({ type: "text", content: newContent });
      setCitationUrl("");
      setPopoverOpen(false);
      setShowToolbar(false);
      insertionPointRef.current = null;
    } finally {
      setIsCiting(false);
    }
  }

  // Clicking inside the textarea without creating a selection should
  // dismiss the toolbar (unless the popover is open).
  function handleTextareaClick() {
    if (popoverOpen) return;
    const el = textareaRef.current;
    if (el && el.selectionStart === el.selectionEnd) {
      setShowToolbar(false);
      insertionPointRef.current = null;
    }
  }

  // Wraps the current selection with the given markdown marker (e.g. "**" or "*")
  // and restores focus + selection so the user can keep formatting right away.
  function wrapSelection(marker: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start === end) return;

    const newContent =
      block.content.slice(0, start) +
      marker +
      block.content.slice(start, end) +
      marker +
      block.content.slice(end);
    onChange({ type: "text", content: newContent });

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, end + marker.length);
    });
  }

  const handleBold = useCallback(() => wrapSelection("**"), [block.content, onChange]);
  const handleItalic = useCallback(() => wrapSelection("*"), [block.content, onChange]);

  return {
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
  };
}

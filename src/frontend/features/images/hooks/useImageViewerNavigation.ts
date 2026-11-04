import { useEffect, useRef } from "react";

/**
 * Navegação do ImageViewer: teclado (setas/Escape), sincronização de scroll
 * da tira horizontal (scroll-snap) com `currentIndex`, e detecção de swipe
 * para trocar de imagem.
 *
 * Quando `navigationEnabled` é `false` (zoom ativo no slide atual), o drag
 * horizontal deixa de trocar de imagem — a tira para de responder a scroll
 * (ver `ImageViewer.tsx`, que desliga `overflow-x`/`snap` no container
 * enquanto `isZoomed`) e `handleScroll` ignora eventos residuais. Navegação
 * por teclado, botões de seta e miniaturas continuam funcionando sempre,
 * independentemente do zoom.
 */
export function useImageViewerNavigation({
  open,
  imagesLength,
  currentIndex,
  navigationEnabled,
  onClose,
  onNavigate,
}: {
  open: boolean;
  imagesLength: number;
  currentIndex: number;
  navigationEnabled: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imagesLength - 1;

  const scrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, currentIndex, onClose, onNavigate]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    isSyncingRef.current = true;
    el.scrollTo({ left: currentIndex * el.clientWidth, behavior: justOpened ? "auto" : "smooth" });
    const t = setTimeout(() => {
      isSyncingRef.current = false;
    }, 350);
    return () => clearTimeout(t);
  }, [currentIndex, open]);

  function handleScroll() {
    if (isSyncingRef.current || !navigationEnabled) return;
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current);
    scrollEndTimeoutRef.current = setTimeout(() => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      if (idx !== currentIndex && idx >= 0 && idx < imagesLength) onNavigate(idx);
    }, 100);
  }

  return { scrollRef, hasPrev, hasNext, handleScroll };
}

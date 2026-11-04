import { useCallback, useRef, useState } from "react";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

export const IMAGE_ZOOM_MIN_SCALE = 1;
export const IMAGE_ZOOM_MAX_SCALE = 4;

/**
 * Coordena o estado de zoom/pan do slide ativo no ImageViewer.
 *
 * Cada imagem da tira horizontal tem sua própria instância de
 * `TransformWrapper` (react-zoom-pan-pinch). Este hook guarda uma ref por
 * imagem (por `id`), expõe se o slide atualmente ativo está com zoom > 1x
 * (`isZoomed`) e permite resetar o zoom de todas as instâncias de uma vez —
 * usado ao trocar de imagem (setas/teclado/miniaturas) ou ao fechar o viewer.
 */
export function useImageZoom(activeImageId: number | undefined) {
  const [isZoomed, setIsZoomed] = useState(false);
  const transformRefs = useRef(new Map<number, ReactZoomPanPinchContentRef>());
  const refCallbacks = useRef(new Map<number, (ref: ReactZoomPanPinchContentRef | null) => void>());

  const getTransformRefCallback = useCallback((imageId: number) => {
    let callback = refCallbacks.current.get(imageId);
    if (!callback) {
      callback = (ref: ReactZoomPanPinchContentRef | null) => {
        if (ref) transformRefs.current.set(imageId, ref);
        else transformRefs.current.delete(imageId);
      };
      refCallbacks.current.set(imageId, callback);
    }
    return callback;
  }, []);

  const handleTransformed = useCallback(
    (imageId: number, scale: number) => {
      if (imageId === activeImageId) setIsZoomed(scale > 1.01);
    },
    [activeImageId],
  );

  const resetAllZoom = useCallback(() => {
    transformRefs.current.forEach((ref) => ref.resetTransform());
    setIsZoomed(false);
  }, []);

  return { isZoomed, getTransformRefCallback, handleTransformed, resetAllZoom };
}

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { IMAGE_ZOOM_MIN_SCALE, IMAGE_ZOOM_MAX_SCALE } from "@/frontend/features/images/hooks/useImageZoom";
import type { ViewerImage } from "./ImageViewer";

type Props = {
  image: ViewerImage;
  /** Se este é o slide atualmente visível (controla se o pan fica habilitado). */
  isActive: boolean;
  isZoomed: boolean;
  onTransform: (scale: number) => void;
  transformRef: (ref: ReactZoomPanPinchContentRef | null) => void;
};

/**
 * Um slide da tira horizontal do ImageViewer. Cada imagem tem sua própria
 * instância de `TransformWrapper` (zoom/pan independente); o pan só fica
 * habilitado no slide ativo e enquanto ele estiver com zoom > 1x — nos
 * demais casos o drag horizontal continua navegando entre imagens (ver
 * `ImageViewer.tsx`).
 */
export function ImageViewerSlide({ image, isActive, isZoomed, onTransform, transformRef }: Props) {
  if (!image.url) {
    return (
      <div className="flex flex-col items-center gap-3 text-neutral-500">
        <div className="w-16 h-16 rounded border-2 border-neutral-600 flex items-center justify-center">
          <span className="text-2xl">🖼</span>
        </div>
        {image.alt && <p className="text-sm text-neutral-400">[{image.alt}]</p>}
      </div>
    );
  }

  return (
    <TransformWrapper
      ref={transformRef}
      initialScale={IMAGE_ZOOM_MIN_SCALE}
      minScale={IMAGE_ZOOM_MIN_SCALE}
      maxScale={IMAGE_ZOOM_MAX_SCALE}
      centerOnInit
      doubleClick={{ mode: "toggle" }}
      panning={{ disabled: !(isActive && isZoomed) }}
      onTransform={(_ref, state) => onTransform(state.scale)}
    >
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={image.url}
          alt={image.alt ?? ""}
          draggable={false}
          className="max-h-full max-w-full object-contain"
        />
      </TransformComponent>
    </TransformWrapper>
  );
}

"use client";

import * as React from "react";
import {
  FlipHorizontal2Icon,
  RotateCcwIcon,
  RotateCwIcon,
  SunIcon,
  ZoomInIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

type EditorShape = "circle" | "rect";

interface ImageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  shape?: EditorShape;
  /** width / height, only used when shape is "rect" */
  aspect?: number;
  outputSize?: { width: number; height: number };
  title?: string;
  onSave: (dataUrl: string) => void;
}

interface Adjustments {
  zoom: number;
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
  offsetX: number;
  offsetY: number;
  brightness: number;
  contrast: number;
  saturate: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  zoom: 1,
  rotation: 0,
  flipped: false,
  offsetX: 0,
  offsetY: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
};

function filterCss(a: Pick<Adjustments, "brightness" | "contrast" | "saturate">) {
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturate}%)`;
}

export function ImageEditorDialog({
  open,
  onOpenChange,
  imageSrc,
  shape = "rect",
  aspect = 16 / 9,
  outputSize,
  title = "Edit photo",
  onSave,
}: ImageEditorDialogProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [natural, setNatural] = React.useState({ width: 0, height: 0 });
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const [adj, setAdj] = React.useState<Adjustments>(DEFAULT_ADJUSTMENTS);

  // Track viewport size via ResizeObserver
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const { width, height } = e.contentRect;
      setViewport((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]); // re-attach when dialog opens

  const rotatedNatural = React.useMemo(() => {
    if (adj.rotation === 90 || adj.rotation === 270) {
      return { width: natural.height, height: natural.width };
    }
    return natural;
  }, [natural, adj.rotation]);

  // baseScale: scale so image fills (covers) the viewport
  const baseScale = React.useMemo(() => {
    if (!viewport.width || !viewport.height || !rotatedNatural.width || !rotatedNatural.height) {
      return 1;
    }
    return Math.max(
      viewport.width / rotatedNatural.width,
      viewport.height / rotatedNatural.height
    );
  }, [viewport, rotatedNatural]);

  const effectiveScale = baseScale * adj.zoom;

  const clampOffset = React.useCallback(
    (x: number, y: number, scale: number) => {
      const scaledW = rotatedNatural.width * scale;
      const scaledH = rotatedNatural.height * scale;
      const maxX = Math.max(0, (scaledW - viewport.width) / 2);
      const maxY = Math.max(0, (scaledH - viewport.height) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    [rotatedNatural, viewport]
  );

  const displayOffset = effectiveScale
    ? clampOffset(adj.offsetX, adj.offsetY, effectiveScale)
    : { x: 0, y: 0 };

  // Drag state stored in a ref so we don't cause re-renders during drag
  const dragState = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    // Capture on the viewport div itself
    viewportRef.current?.setPointerCapture(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: adj.offsetX,
      startOffsetY: adj.offsetY,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const next = clampOffset(drag.startOffsetX + dx, drag.startOffsetY + dy, effectiveScale);
    setAdj((prev) => ({ ...prev, offsetX: next.x, offsetY: next.y }));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
      viewportRef.current?.releasePointerCapture(e.pointerId);
    }
  }

  function rotateBy(delta: 90 | -90) {
    setAdj((prev) => ({
      ...prev,
      rotation: (((prev.rotation + delta + 360) % 360) as Adjustments["rotation"]),
      offsetX: 0,
      offsetY: 0,
    }));
  }

  function handleSave() {
    const imgEl = imgRef.current;
    if (!imgEl || !natural.width || !natural.height) return;

    // Use actual viewport size, or fallback to a default
    const vw = viewport.width || 400;
    const vh = viewport.height || 400;

    const target =
      outputSize ??
      (shape === "circle"
        ? { width: 480, height: 480 }
        : { width: 1200, height: Math.round(1200 / aspect) });

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outScale = target.width / vw;

    ctx.save();
    ctx.filter = filterCss(adj);
    // Move to center of canvas + pan offset
    ctx.translate(
      canvas.width / 2 + displayOffset.x * outScale,
      canvas.height / 2 + displayOffset.y * outScale
    );
    // Apply rotation
    ctx.rotate((adj.rotation * Math.PI) / 180);
    // Apply flip
    if (adj.flipped) ctx.scale(-1, 1);
    // Apply effective scale (baseScale * zoom)
    const drawScale = effectiveScale * outScale;
    ctx.scale(drawScale, drawScale);
    // Draw image centered
    ctx.drawImage(imgEl, -natural.width / 2, -natural.height / 2, natural.width, natural.height);
    ctx.restore();

    const mime = shape === "circle" ? "image/png" : "image/jpeg";
    onSave(canvas.toDataURL(mime, 0.92));
    onOpenChange(false);
  }

  // The image transform: we position the image at center via the parent flex,
  // then apply: translate(pan) → rotate → scale
  // In CSS transform order (right to left execution): scale first, then rotate, then translate
  // This means: image is scaled up, then rotated, then panned — which is what we want.
  const imageTransform = [
    `translate(${displayOffset.x}px, ${displayOffset.y}px)`,
    `rotate(${adj.rotation}deg)`,
    adj.flipped ? "scaleX(-1)" : "",
    `scale(${effectiveScale || baseScale || 1})`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Drag to reposition, then adjust zoom, rotation, and light to taste.
          </DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <>
            {/* Viewport / crop window */}
            <div
              ref={viewportRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "relative mx-auto w-full overflow-hidden bg-muted touch-none cursor-grab active:cursor-grabbing select-none",
                shape === "circle"
                  ? "max-w-64 aspect-square rounded-full"
                  : "aspect-[var(--editor-aspect)] rounded-xl"
              )}
              style={
                shape === "rect"
                  ? ({ "--editor-aspect": aspect } as React.CSSProperties)
                  : undefined
              }
            >
              {/* Image centered in viewport; transform moves it around */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt=""
                  draggable={false}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setNatural({ width: el.naturalWidth, height: el.naturalHeight });
                  }}
                  className="max-w-none pointer-events-none origin-center"
                  style={{
                    width: natural.width || undefined,
                    height: natural.height || undefined,
                    transform: imageTransform,
                    filter: filterCss(adj),
                    willChange: "transform",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => rotateBy(-90)}
                aria-label="Rotate left"
              >
                <RotateCcwIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => rotateBy(90)}
                aria-label="Rotate right"
              >
                <RotateCwIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant={adj.flipped ? "secondary" : "outline"}
                size="icon-sm"
                onClick={() => setAdj((p) => ({ ...p, flipped: !p.flipped }))}
                aria-label="Flip horizontal"
              >
                <FlipHorizontal2Icon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setAdj(DEFAULT_ADJUSTMENTS)}
              >
                Reset
              </Button>
            </div>

            <div className="flex flex-col gap-3.5 pt-1">
              <div className="flex items-center gap-3">
                <ZoomInIcon className="size-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[adj.zoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  onValueChange={([v]) => setAdj((p) => ({ ...p, zoom: v }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <SunIcon className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Brightness</span>
                    <Slider
                      value={[adj.brightness]}
                      min={50}
                      max={150}
                      step={1}
                      onValueChange={([v]) => setAdj((p) => ({ ...p, brightness: v }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Contrast</span>
                    <Slider
                      value={[adj.contrast]}
                      min={50}
                      max={150}
                      step={1}
                      onValueChange={([v]) => setAdj((p) => ({ ...p, contrast: v }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Saturation</span>
                    <Slider
                      value={[adj.saturate]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([v]) => setAdj((p) => ({ ...p, saturate: v }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!imageSrc || !natural.width}>
            Save photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ImageIcon,
  Loader2,
  Maximize2,
  Minus,
  Move,
  Plus,
  RotateCw,
  Wand2,
  ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/project.store';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  projectName: string;
  onGenerate?: () => void;
  onRegenerate?: () => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function CanvasPreview({
  projectName,
  onGenerate,
  onRegenerate,
}: CanvasPreviewProps) {
  const { generatedImages, isGenerating, selectedImageId, selectImage } =
    useProjectStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    const existing = new Set(positions.map((p) => p.id));
    const newNodes = generatedImages.filter((img) => !existing.has(img.id));
    if (newNodes.length > 0) {
      setPositions((prev) => [
        ...prev,
        ...newNodes.map((img, i) => ({
          id: img.id,
          x: 40 + (prev.length + i) * 30,
          y: 40 + (prev.length + i) * 30,
        })),
      ]);
    }
  }, [generatedImages, positions]);

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, z - 0.25));
  const handleZoomReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = useCallback(
    (id: string, e: ReactPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      selectImage(id);
      const pos = positions.find((p) => p.id === id);
      if (!pos) return;
      setDragging({
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      });
    },
    [positions, selectImage],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: globalThis.PointerEvent) => {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      setPositions((prev) =>
        prev.map((p) =>
          p.id === dragging.id
            ? { ...p, x: dragging.origX + dx, y: dragging.origY + dy }
            : p,
        ),
      );
    };
    const onUp = () => setDragging(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, zoom]);

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.canvas) {
        selectImage(null);
      }
    },
    [selectImage],
  );

  const hasImages = generatedImages.length > 0;

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handleCanvasPointerDown}
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-[#fafafa] dark:bg-[#141414]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border) / 0.3) 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
      >
        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="relative size-8 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium">Génération en cours...</p>
          </div>
        )}

        {/* Image nodes */}
        {hasImages && (
          <div
            data-canvas="true"
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: '0 0',
            }}
          >
            {generatedImages.map((img) => {
              const pos = positions.find((p) => p.id === img.id) ?? {
                x: 40,
                y: 40,
              };
              const isSelected = img.id === (selectedImageId ?? generatedImages[0]?.id);
              return (
                <div
                  key={img.id}
                  onPointerDown={(e) => handlePointerDown(img.id, e)}
                  className={cn(
                    'absolute cursor-grab select-none rounded-lg border-2 bg-card shadow-lg transition-shadow active:cursor-grabbing',
                    isSelected
                      ? 'border-primary shadow-primary/20 ring-2 ring-primary/10'
                      : 'border-border/50 hover:border-primary/30',
                  )}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: Math.min(img.width, 320),
                    touchAction: 'none',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={projectName}
                    className="rounded-t-md object-cover"
                    draggable={false}
                  />
                  {isSelected && (
                    <div className="flex items-center gap-1 border-t px-2 py-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={onRegenerate}
                        title="Régénérer"
                      >
                        <RotateCw className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        title="Varier"
                      >
                        <Wand2 className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        title="Agrandir"
                      >
                        <Maximize2 className="size-3" />
                      </Button>
                      <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Move className="size-3" /> Glisser
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasImages && !isGenerating && (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <ImageIcon className="size-7 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Aucun visuel généré</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Décrivez votre besoin dans le chat pour commencer.
              </p>
            </div>
            {onGenerate && (
              <Button size="sm" onClick={onGenerate} className="mt-1">
                <Wand2 className="mr-2 size-3.5" />
                Générer un visuel
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Canvas toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleZoomOut}
            title="Dézoomer"
          >
            <Minus className="size-3.5" />
          </Button>
          <button
            onClick={handleZoomReset}
            className="min-w-[40px] px-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleZoomIn}
            title="Zoomer"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating || !hasImages}
            className="h-7 text-xs"
          >
            <RotateCw className={cn('mr-1.5 size-3', isGenerating && 'animate-spin')} />
            Régénérer
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating || !hasImages}
            className="h-7 text-xs"
          >
            <Wand2 className="mr-1.5 size-3" />
            Varier
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating || !hasImages}
            className="h-7 text-xs"
          >
            <ZoomIn className="mr-1.5 size-3" />
            HD
          </Button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {generatedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {generatedImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => selectImage(img.id)}
              className={cn(
                'size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                img.id === (selectedImageId ?? generatedImages[0]?.id)
                  ? 'border-primary shadow-sm'
                  : 'border-border/40 hover:border-primary/30',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

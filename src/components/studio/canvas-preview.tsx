'use client';

import { useRef, useState, useCallback } from 'react';
import {
  ImageIcon,
  Loader2,
  Maximize2,
  RotateCw,
  Wand2,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore, type GeneratedImage } from '@/stores/project.store';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  projectName: string;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onSelectForChat?: (image: GeneratedImage) => void;
}

export function CanvasPreview({
  projectName,
  onGenerate,
  onRegenerate,
  onSelectForChat,
}: CanvasPreviewProps) {
  const { generatedImages, isGenerating, selectedImageId, selectImage } =
    useProjectStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  const handleSelect = useCallback(
    (img: GeneratedImage) => {
      selectImage(img.id === selectedImageId ? null : img.id);
    },
    [selectImage, selectedImageId],
  );

  const handleDoubleClick = useCallback((img: GeneratedImage) => {
    setLightboxImage(img);
  }, []);

  const handleSendToChat = useCallback(
    (img: GeneratedImage) => {
      onSelectForChat?.(img);
    },
    [onSelectForChat],
  );

  const hasImages = generatedImages.length > 0;
  const imageCount = generatedImages.length;

  const gridCols =
    imageCount === 1
      ? 'grid-cols-1'
      : imageCount === 2
        ? 'grid-cols-2'
        : imageCount <= 4
          ? 'grid-cols-2'
          : 'grid-cols-3';

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative min-h-[280px] overflow-hidden rounded-xl border border-border/50 bg-[#fafafa] dark:bg-[#141414]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border) / 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="relative size-8 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium">Création du visuel en cours...</p>
          </div>
        )}

        {/* Image grid */}
        {hasImages && (
          <div className={cn('grid gap-3 p-4', gridCols)}>
            {generatedImages.map((img) => {
              const isSelected = img.id === selectedImageId;
              return (
                <div
                  key={img.id}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border-2 bg-card shadow-sm transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary shadow-primary/20 ring-2 ring-primary/10'
                      : 'border-border/50 hover:border-primary/30 hover:shadow-md',
                  )}
                  onClick={() => handleSelect(img)}
                  onDoubleClick={() => handleDoubleClick(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={projectName}
                    className="w-full object-cover"
                    style={{ maxHeight: imageCount === 1 ? '400px' : '260px' }}
                    draggable={false}
                  />

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <CheckCircle2 className="size-5 text-primary drop-shadow-md" />
                    </div>
                  )}

                  {/* Provider badge */}
                  {img.provider && (
                    <div className="absolute left-2 top-2">
                      <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {img.provider === 'openai'
                          ? 'Standard'
                          : img.provider === 'flux'
                            ? 'Premium'
                            : img.provider === 'ideogram'
                              ? 'Créatif'
                              : img.provider}
                      </span>
                    </div>
                  )}

                  {/* Action overlay on hover/select */}
                  <div
                    className={cn(
                      'absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerate?.();
                      }}
                      title="Régénérer"
                    >
                      <RotateCw className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-white hover:bg-white/20"
                      title="Varier"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Wand2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClick(img);
                      }}
                      title="Agrandir"
                    >
                      <Maximize2 className="size-3.5" />
                    </Button>
                    {onSelectForChat && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-7 gap-1 text-[10px] text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToChat(img);
                        }}
                        title="Utiliser comme référence dans le chat"
                      >
                        <ImageIcon className="size-3" />
                        Retoucher
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasImages && !isGenerating && (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3">
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
      {hasImages && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {imageCount} visuel{imageCount > 1 ? 's' : ''} — cliquez pour sélectionner, double-cliquez pour agrandir
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              <RotateCw
                className={cn('mr-1.5 size-3', isGenerating && 'animate-spin')}
              />
              Régénérer
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              <Wand2 className="mr-1.5 size-3" />
              Varier
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              <ZoomIn className="mr-1.5 size-3" />
              HD
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={projectName}
              className="max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {onSelectForChat && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleSendToChat(lightboxImage);
                    setLightboxImage(null);
                  }}
                >
                  <ImageIcon className="mr-1.5 size-3.5" />
                  Retoucher dans le chat
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80"
                onClick={() => setLightboxImage(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

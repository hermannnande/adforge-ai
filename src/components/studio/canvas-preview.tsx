'use client';

import { ImageIcon, Loader2, RefreshCw, Wand2, Crown, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/project.store';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  projectName: string;
  onGenerate?: () => void;
  onRegenerate?: () => void;
}

export function CanvasPreview({ projectName, onGenerate, onRegenerate }: CanvasPreviewProps) {
  const { generatedImages, isGenerating, selectedImageId, selectImage } = useProjectStore();

  const selectedImage = generatedImages.find((img) => img.id === selectedImageId) ?? generatedImages[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        {isGenerating && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Génération en cours…</p>
          </div>
        )}

        {selectedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedImage.url}
            alt={projectName}
            className="size-full object-contain"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-8 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Aucun visuel généré</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Décrivez votre besoin dans le chat pour commencer.
              </p>
            </div>
            {onGenerate && (
              <Button size="sm" onClick={onGenerate} className="mt-2">
                <Wand2 className="mr-2 size-3.5" />
                Générer un visuel
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isGenerating}>
          <RefreshCw className={cn('mr-2 size-3.5', isGenerating && 'animate-spin')} />
          Régénérer
        </Button>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          <Wand2 className="mr-2 size-3.5" />
          Varier
        </Button>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          <Crown className="mr-2 size-3.5" />
          HD
        </Button>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          <Layers className="mr-2 size-3.5" />
          Multi-format
        </Button>
      </div>

      {generatedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {generatedImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => selectImage(img.id)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                img.id === (selectedImageId ?? generatedImages[0]?.id)
                  ? 'border-primary'
                  : 'border-border/50 hover:border-primary/40',
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

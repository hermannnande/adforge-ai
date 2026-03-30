'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Download, Settings, Cpu, Zap, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatPanel } from './chat-panel';
import { CanvasPreview } from './canvas-preview';
import { useChatStore, type ChatAuthInfo } from '@/stores/chat.store';
import { useProjectStore, type GeneratedImage } from '@/stores/project.store';

type ProviderChoice = 'auto' | 'openai' | 'flux';

const PROVIDER_OPTIONS: {
  value: ProviderChoice;
  label: string;
  icon: typeof Cpu;
  desc: string;
}[] = [
  { value: 'auto', label: 'Auto', icon: Sparkles, desc: 'AdForge choisit le meilleur moteur' },
  { value: 'openai', label: 'Standard', icon: Cpu, desc: 'Polyvalent — itérations rapides' },
  { value: 'flux', label: 'Premium', icon: Zap, desc: 'Photoréaliste haute fidélité' },
];

interface StudioShellProps {
  projectId: string;
  projectName: string;
  platform: string;
  initialPrompt?: string;
}

export function StudioShell({
  projectId,
  projectName,
  platform,
  initialPrompt,
}: StudioShellProps) {
  const { getToken, userId, sessionId } = useAuth();
  const auth = useMemo<ChatAuthInfo>(
    () => ({ getToken, userId, sessionId }),
    [getToken, userId, sessionId],
  );

  const [selectedProvider, setSelectedProvider] = useState<ProviderChoice>('auto');
  const [chatReferenceImage, setChatReferenceImage] = useState<GeneratedImage | null>(null);

  const chatReset = useChatStore((s) => s.reset);
  const brief = useChatStore((s) => s.brief);
  const strategy = useChatStore((s) => s.strategy);
  const shouldGenerate = useChatStore((s) => s.shouldGenerate);
  const selectedSuggestionIndex = useChatStore((s) => s.selectedSuggestionIndex);
  const setShouldGenerate = useChatStore((s) => s.setShouldGenerate);
  const lastReferenceImageUrls = useChatStore((s) => s.lastReferenceImageUrls);

  const projectReset = useProjectStore((s) => s.reset);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  const loadImages = useProjectStore((s) => s.loadImages);
  const triggerGeneration = useProjectStore((s) => s.triggerGeneration);
  const isGenerating = useProjectStore((s) => s.isGenerating);
  const generationError = useProjectStore((s) => s.generationError);
  const lastMeta = useProjectStore((s) => s.lastGenerationMeta);

  useEffect(() => {
    setCurrentProject(projectId);
    loadImages(projectId, auth);
    return () => {
      chatReset();
      projectReset();
    };
  }, [projectId, chatReset, projectReset, setCurrentProject, loadImages, auth]);

  useEffect(() => {
    if (!shouldGenerate || isGenerating || !brief || !strategy) return;

    const suggestion =
      strategy.suggestions[selectedSuggestionIndex] ?? strategy.suggestions[0];
    if (!suggestion) return;

    setShouldGenerate(false);
    triggerGeneration(projectId, brief, suggestion, auth, {
      platform,
      provider: selectedProvider === 'auto' ? undefined : selectedProvider,
      referenceImageUrls: lastReferenceImageUrls.length > 0 ? lastReferenceImageUrls : undefined,
    });
  }, [
    shouldGenerate, isGenerating, brief, strategy, selectedSuggestionIndex,
    setShouldGenerate, triggerGeneration, projectId, auth, platform, selectedProvider,
    lastReferenceImageUrls,
  ]);

  const handleGenerate = useCallback(() => {
    if (!brief || !strategy) {
      useChatStore.getState().sendMessage(
        projectId,
        'Génère un visuel avec les paramètres actuels',
        auth,
      );
      return;
    }
    const suggestion =
      strategy.suggestions[selectedSuggestionIndex] ?? strategy.suggestions[0];
    if (suggestion) {
      triggerGeneration(projectId, brief, suggestion, auth, {
        platform,
        provider: selectedProvider === 'auto' ? undefined : selectedProvider,
        referenceImageUrls: lastReferenceImageUrls.length > 0 ? lastReferenceImageUrls : undefined,
      });
    }
  }, [projectId, auth, brief, strategy, selectedSuggestionIndex, triggerGeneration, platform, selectedProvider, lastReferenceImageUrls]);

  const handleSelectForChat = useCallback((img: GeneratedImage) => {
    setChatReferenceImage(img);
  }, []);

  const handleClearReference = useCallback(() => {
    setChatReferenceImage(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            {projectName}
          </h1>
          <Badge>{platform}</Badge>
          <Badge variant="outline">En cours</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
            {PROVIDER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedProvider === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedProvider(opt.value)}
                  title={opt.desc}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3" />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="mr-1.5 size-3" />
            Exporter
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs">
            <Settings className="mr-1.5 size-3" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Provider info banner — smart routing feedback */}
      {lastMeta?.provider && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {lastMeta.provider === 'openai'
              ? 'Standard'
              : lastMeta.provider === 'flux'
                ? 'Premium'
                : lastMeta.provider === 'ideogram'
                  ? 'Créatif'
                  : lastMeta.provider}
          </span>
          {lastMeta.routerReason && (
            <span className="hidden text-muted-foreground/70 sm:inline" title={lastMeta.routerReason}>
              — {lastMeta.routerReason.split('|')[0]?.trim()}
            </span>
          )}
          {lastMeta.taskType && (
            <Badge variant="secondary" className="text-[10px]">
              {lastMeta.taskType.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          )}
          {lastMeta.fallbackUsed && (
            <Badge variant="outline" className="border-amber-500/30 text-[10px] text-amber-600">
              Fallback
            </Badge>
          )}
          {lastMeta.qualityScore != null && (
            <Badge
              variant="outline"
              className={`text-[10px] ${lastMeta.qualityScore >= 7 ? 'border-green-500/30 text-green-600' : lastMeta.qualityScore >= 5 ? 'border-yellow-500/30 text-yellow-600' : 'border-red-500/30 text-red-600'}`}
            >
              Q: {lastMeta.qualityScore}/10
            </Badge>
          )}
          {lastMeta.creditsCost != null && (
            <Badge variant="outline" className="ml-auto text-[10px]">
              {lastMeta.creditsCost} crédit{lastMeta.creditsCost > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      {/* Generation error banner */}
      {generationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {generationError}
        </div>
      )}

      {/* Main layout: Canvas + Chat */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CanvasPreview
            projectName={projectName}
            onGenerate={handleGenerate}
            onRegenerate={handleGenerate}
            onSelectForChat={handleSelectForChat}
          />
        </div>

        <div className="h-[560px] overflow-hidden rounded-xl border border-border/50 bg-card lg:col-span-2">
          <ChatPanel
            projectId={projectId}
            initialPrompt={initialPrompt}
            referenceImage={chatReferenceImage}
            onClearReference={handleClearReference}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Download, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatPanel } from './chat-panel';
import { CanvasPreview } from './canvas-preview';
import { useChatStore, type ChatAuthInfo } from '@/stores/chat.store';
import { useProjectStore } from '@/stores/project.store';

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
  const chatReset = useChatStore((s) => s.reset);
  const projectReset = useProjectStore((s) => s.reset);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  useEffect(() => {
    setCurrentProject(projectId);
    return () => {
      chatReset();
      projectReset();
    };
  }, [projectId, chatReset, projectReset, setCurrentProject]);

  const handleGenerate = useCallback(() => {
    useChatStore
      .getState()
      .sendMessage(projectId, 'Génère un visuel avec les paramètres actuels', auth);
  }, [projectId, auth]);

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
        <div className="flex flex-wrap gap-2">
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

      {/* Main layout: Canvas + Chat */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CanvasPreview
            projectName={projectName}
            onGenerate={handleGenerate}
          />
        </div>

        <div className="h-[560px] overflow-hidden rounded-xl border border-border/50 bg-card lg:col-span-2">
          <ChatPanel projectId={projectId} initialPrompt={initialPrompt} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useCallback } from 'react';
import { Download, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatPanel } from './chat-panel';
import { CanvasPreview } from './canvas-preview';
import { useChatStore } from '@/stores/chat.store';
import { useProjectStore } from '@/stores/project.store';

interface StudioShellProps {
  projectId: string;
  projectName: string;
  platform: string;
}

export function StudioShell({ projectId, projectName, platform }: StudioShellProps) {
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
      .sendMessage(projectId, 'Génère un visuel avec les paramètres actuels');
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{projectName}</h1>
          <Badge>{platform}</Badge>
          <Badge variant="outline">En cours</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">
            <Download className="mr-2 size-3.5" />
            Exporter
          </Button>
          <Button size="sm" variant="ghost">
            <Settings className="mr-2 size-3.5" />
            Paramètres
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CanvasPreview
            projectName={projectName}
            onGenerate={handleGenerate}
          />
        </div>

        <Card className="h-[560px] overflow-hidden p-0">
          <ChatPanel projectId={projectId} />
        </Card>
      </div>
    </div>
  );
}

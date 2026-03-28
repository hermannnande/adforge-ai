'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { StudioShell } from '@/components/studio/studio-shell';

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  INSTAGRAM_FEED: 'Instagram — fil',
  INSTAGRAM_STORY: 'Instagram — story',
  TIKTOK_ADS: 'TikTok Ads',
  FLYER_PRINT: 'Flyer / print',
  CUSTOM: 'Générique',
};

interface ProjectData {
  id: string;
  name: string;
  platform: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') ?? undefined;
  const { getToken, userId, sessionId, isLoaded, isSignedIn } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    authFetch(`/api/projects/${projectId}`, { getToken, userId, sessionId })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((d) => setProject(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getToken, isLoaded, isSignedIn, projectId, sessionId, userId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Chargement du projet...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">
          {error ?? 'Projet introuvable'}
        </p>
        <Link
          href="/app/projects"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/app/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Retour aux projets
        </Link>
      </div>

      <StudioShell
        projectId={project.id}
        projectName={project.name}
        platform={PLATFORM_LABELS[project.platform] ?? project.platform}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}

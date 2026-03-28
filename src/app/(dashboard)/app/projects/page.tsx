'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, List, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  NewProjectDialog,
  NewProjectEmptyTrigger,
  NewProjectToolbarTrigger,
} from '@/components/dashboard/new-project-dialog';

const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-yellow-500',
  'from-blue-500 to-cyan-500',
];

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  INSTAGRAM_FEED: 'Instagram — fil',
  INSTAGRAM_STORY: 'Instagram — story',
  TIKTOK_ADS: 'TikTok Ads',
  WHATSAPP_STATUS: 'WhatsApp status',
  BANNER_WEB: 'Bannière web',
  FLYER_PRINT: 'Flyer / print',
  CUSTOM: 'Générique',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const days = Math.floor(hr / 24);
  return `il y a ${days} j`;
}

interface ProjectItem {
  id: string;
  name: string;
  platform: string | null;
  updatedAt: string;
  imageCount: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const total = projects.length;

  return (
    <NewProjectDialog>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <NewProjectToolbarTrigger />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un projet..."
              className="h-9 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md bg-muted shadow-sm"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {total === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <Sparkles className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-semibold tracking-tight">
              Aucun projet
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Créez un projet pour générer des visuels publicitaires adaptés à
              vos plateformes.
            </p>
            <NewProjectEmptyTrigger />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className="block cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                  <div
                    className={cn(
                      'aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-gradient-to-br',
                      GRADIENTS[index % GRADIENTS.length],
                    )}
                  />
                  <CardContent className="space-y-3 p-4">
                    <p className="font-semibold leading-snug">{project.name}</p>
                    <Badge variant="secondary">
                      {project.platform
                        ? (PLATFORM_LABELS[project.platform] ?? project.platform)
                        : 'Général'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(project.updatedAt)}
                    </p>
                    <Badge variant="outline" className="w-fit font-normal">
                      {project.imageCount === 0
                        ? 'Aucun visuel'
                        : `${project.imageCount} visuel${project.imageCount > 1 ? 's' : ''}`}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {total} projet{total > 1 ? 's' : ''}
        </p>
      </div>
    </NewProjectDialog>
  );
}

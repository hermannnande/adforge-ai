import type { Metadata } from 'next';
import type { PlatformTarget } from '@prisma/client';
import { LayoutGrid, List, Search } from 'lucide-react';
import Link from 'next/link';

import {
  NewProjectDialog,
  NewProjectEmptyTrigger,
  NewProjectToolbarTrigger,
} from '@/components/dashboard/new-project-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { prisma } from '@/lib/db/prisma';
import { cn } from '@/lib/utils';
import { userService } from '@/server/services/user.service';

export const metadata: Metadata = { title: 'Projets' };

const PROJECT_CARD_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-yellow-500',
  'from-blue-500 to-cyan-500',
] as const;

const PLATFORM_LABELS: Record<PlatformTarget, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  INSTAGRAM_FEED: 'Instagram — fil',
  INSTAGRAM_STORY: 'Instagram — story',
  TIKTOK_ADS: 'TikTok Ads',
  WHATSAPP_STATUS: 'WhatsApp status',
  BANNER_WEB: 'Bannière web',
  FLYER_PRINT: 'Flyer / print',
  CUSTOM: 'Générique',
};

function formatRelativeTimeFr(date: Date): string {
  const deltaMs = Date.now() - date.getTime();
  const sec = Math.floor(deltaMs / 1000);
  if (sec < 45) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return min <= 1 ? 'il y a 1 min' : `il y a ${min} min`;
  }
  const hr = Math.floor(min / 60);
  if (hr < 24) {
    return hr === 1 ? 'il y a 1 h' : `il y a ${hr} h`;
  }
  const days = Math.floor(hr / 24);
  if (days < 7) {
    return days === 1 ? 'il y a 1 jour' : `il y a ${days} jours`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? 'il y a 1 semaine' : `il y a ${weeks} semaines`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? 'il y a 1 mois' : `il y a ${months} mois`;
  }
  const years = Math.floor(days / 365);
  return years <= 1 ? 'il y a 1 an' : `il y a ${years} ans`;
}

function platformBadgeLabel(platform: PlatformTarget | null | undefined): string {
  if (platform == null) return 'Général';
  return PLATFORM_LABELS[platform] ?? platform;
}

function imageCountLabel(n: number): string {
  if (n === 0) return 'Aucun visuel';
  if (n === 1) return '1 visuel';
  return `${n} visuels`;
}

export default async function ProjectsPage() {
  const ctx = await userService.requireCurrentWorkspace();

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      deletedAt: null,
      status: { not: 'DELETED' },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      settings: { select: { platform: true } },
      _count: { select: { generatedImages: true } },
    },
  });

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
                aria-pressed="true"
                aria-label="Vue grille"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md"
                aria-pressed="false"
                aria-label="Vue liste"
              >
                <List className="size-4" />
              </Button>
            </div>

            <div
              className={cn(
                'flex h-9 min-w-[140px] items-center rounded-lg border border-input bg-transparent px-2.5 text-sm',
                'text-muted-foreground dark:bg-input/30'
              )}
            >
              Récents
            </div>
          </div>
        </div>

        {total === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-lg font-semibold tracking-tight">Aucun projet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Créez un projet pour générer des visuels publicitaires adaptés à vos
              plateformes.
            </p>
            <NewProjectEmptyTrigger />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const gradient = PROJECT_CARD_GRADIENTS[index % 6];
              const platform = platformBadgeLabel(project.settings?.platform);
              const relative = formatRelativeTimeFr(project.updatedAt);
              const images = project._count.generatedImages;

              return (
                <Link
                  key={project.id}
                  href={`/app/projects/${project.id}`}
                  className="block cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                    <div
                      className={cn(
                        'aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-gradient-to-br',
                        gradient
                      )}
                    />
                    <CardContent className="space-y-3 p-4">
                      <p className="font-semibold leading-snug">{project.name}</p>
                      <Badge variant="secondary">{platform}</Badge>
                      <p className="text-xs text-muted-foreground">{relative}</p>
                      <Badge variant="outline" className="w-fit font-normal">
                        {imageCountLabel(images)}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Affichage de {total} projet{total > 1 ? 's' : ''} sur {total}
        </p>
      </div>
    </NewProjectDialog>
  );
}

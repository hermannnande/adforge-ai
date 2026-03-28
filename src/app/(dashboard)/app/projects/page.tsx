import type { Metadata } from 'next';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Projets' };

const projects = [
  {
    name: 'Campagne Sneakers Pro',
    platform: 'Facebook Ads',
    gradient: 'from-indigo-500 to-purple-600',
    date: 'il y a 2h',
    credits: '4 crédits',
  },
  {
    name: 'Menu Restaurant Napoli',
    platform: 'Flyer A4',
    gradient: 'from-orange-500 to-red-500',
    date: 'il y a 1 jour',
    credits: '6 crédits',
  },
  {
    name: 'Sérum Anti-âge',
    platform: 'Instagram Story',
    gradient: 'from-pink-500 to-rose-500',
    date: 'il y a 2 jours',
    credits: '3 crédits',
  },
  {
    name: 'Villa Prestige',
    platform: 'Bannière Web',
    gradient: 'from-emerald-500 to-teal-600',
    date: 'il y a 3 jours',
    credits: '5 crédits',
  },
  {
    name: 'Collection Été 2025',
    platform: 'Pack Multi-format',
    gradient: 'from-amber-500 to-yellow-500',
    date: 'il y a 5 jours',
    credits: '8 crédits',
  },
  {
    name: 'Coaching Fitness',
    platform: 'TikTok Ads',
    gradient: 'from-blue-500 to-cyan-500',
    date: 'il y a 1 semaine',
    credits: '2 crédits',
  },
] as const;

export default function ProjectsPage() {
  const total = projects.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
        <Button
          nativeButton={false}
          render={<Link href="/app/projects?new=true" />}
          className="shrink-0"
        >
          <Plus className="mr-2 size-4" />
          Nouveau projet
        </Button>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.name}
            href="/app/projects/mock-id"
            className="block cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
              <div
                className={cn(
                  'aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-gradient-to-br',
                  project.gradient
                )}
              />
              <CardContent className="space-y-3 p-4">
                <p className="font-semibold leading-snug">{project.name}</p>
                <Badge variant="secondary">{project.platform}</Badge>
                <p className="text-xs text-muted-foreground">{project.date}</p>
                <Badge variant="outline" className="w-fit font-normal">
                  {project.credits}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Affichage de {total} projets sur {total}
      </p>
    </div>
  );
}

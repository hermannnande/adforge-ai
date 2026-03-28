import type { Metadata } from 'next';
import { Download, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Bibliothèque' };

const FILTERS = [
  { id: 'all', label: 'Toutes', active: true },
  { id: 'fb', label: 'Facebook Ads', active: false },
  { id: 'ig', label: 'Instagram', active: false },
  { id: 'tt', label: 'TikTok', active: false },
  { id: 'flyers', label: 'Flyers', active: false },
  { id: 'banners', label: 'Bannières', active: false },
] as const;

const MOCK_IMAGES = [
  {
    name: 'sneakers-hero-v2.png',
    date: '18 mars 2026',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'menu-napoli-final.png',
    date: '15 mars 2026',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: 'serum-story-1.png',
    date: '12 mars 2026',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    name: 'villa-banner.png',
    date: '10 mars 2026',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'collection-ete-pack.png',
    date: '8 mars 2026',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    name: 'coaching-tiktok.png',
    date: '5 mars 2026',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'sneakers-story.png',
    date: '3 mars 2026',
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    name: 'pizza-flyer-a4.png',
    date: '1 mars 2026',
    gradient: 'from-red-500 to-orange-500',
  },
] as const;

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bibliothèque</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toutes vos créations en un seul endroit.
          </p>
        </div>
        <Button variant="outline" disabled className="shrink-0">
          Exporter la sélection
        </Button>
      </div>

      <Card className="gap-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {FILTERS.map((f) => (
              <Badge
                key={f.id}
                variant={f.active ? 'default' : 'outline'}
                className={cn(
                  'cursor-default rounded-full px-3 py-1 font-normal',
                  f.active && 'bg-primary text-primary-foreground hover:bg-primary'
                )}
              >
                {f.label}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground sm:text-end">24 images</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {MOCK_IMAGES.map((img) => (
          <div
            key={img.name}
            className={cn(
              'group relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br',
              img.gradient
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{img.name}</p>
                <p className="text-[11px] text-white/80">{img.date}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shrink-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                aria-label={`Télécharger ${img.name}`}
              >
                <Download className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Affichage de 8 images sur 24
      </p>
    </div>
  );
}

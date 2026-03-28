import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Brand Kits' };

const KITS = [
  {
    name: 'Sneakers Pro',
    description: 'Marque de sneakers premium',
    colors: ['bg-indigo-600', 'bg-purple-500', 'border bg-white', 'bg-zinc-900'],
    tags: ['Moderne', 'Premium'],
    created: 'Créé il y a 3 jours',
  },
  {
    name: 'Napoli Restaurant',
    description: 'Identité chaleureuse pour restaurant italien',
    colors: ['bg-orange-600', 'bg-red-500', 'bg-amber-100', 'bg-zinc-800'],
    tags: ['Chaleureux', 'Traditionnel'],
    created: 'Créé il y a 1 semaine',
  },
  {
    name: 'Glow Beauty',
    description: 'Cosmétiques et soins haut de gamme',
    colors: ['bg-pink-500', 'bg-rose-400', 'bg-pink-50', 'bg-zinc-900'],
    tags: ['Élégant', 'Féminin'],
    created: 'Créé il y a 2 semaines',
  },
] as const;

function BrandKitCard({
  name,
  description,
  colors,
  tags,
  created,
}: (typeof KITS)[number]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">{name}</CardTitle>
        <CardAction>
          <Badge variant="secondary">4 couleurs</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>{description}</CardDescription>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <span
              key={c}
              className={cn('size-8 shrink-0 rounded-full ring-1 ring-black/10', c)}
              aria-hidden
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="flex flex-col gap-3 border-t border-border px-4 pb-1 pt-4 sm:flex-row sm:items-center sm:justify-between group-data-[size=sm]/card:px-3">
        <span className="text-xs text-muted-foreground">{created}</span>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Modifier
        </Button>
      </div>
    </Card>
  );
}

export default function BrandKitsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Kits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos identités visuelles.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/app/brand-kits/new" />} className="shrink-0">
          Créer un Brand Kit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {KITS.map((kit) => (
          <BrandKitCard key={kit.name} {...kit} />
        ))}

        <Link href="/app/brand-kits/new" className="block h-full min-h-[280px]">
          <Card
            className={cn(
              'h-full min-h-[280px] cursor-pointer justify-center border-dashed transition-colors hover:border-primary/50'
            )}
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Plus className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Créer un Brand Kit</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

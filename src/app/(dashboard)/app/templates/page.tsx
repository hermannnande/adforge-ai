import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Templates' };

const CATEGORIES = [
  'Tous',
  'E-commerce',
  'Restauration',
  'Beauté',
  'Immobilier',
  'Mode',
  'Sport',
] as const;

const TEMPLATES = [
  {
    id: 'promo-flash',
    name: 'Promo Flash',
    category: 'E-commerce',
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    description: 'Promotion éclair avec countdown',
  },
  {
    id: 'menu-du-jour',
    name: 'Menu du Jour',
    category: 'Restauration',
    gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
    description: 'Menu quotidien élégant',
  },
  {
    id: 'nouveau-produit',
    name: 'Nouveau Produit',
    category: 'Beauté',
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
    description: 'Lancement produit beauté',
  },
  {
    id: 'bien-immobilier',
    name: 'Bien Immobilier',
    category: 'Immobilier',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    description: 'Annonce immobilière premium',
  },
  {
    id: 'soldes-ete',
    name: "Soldes d'Été",
    category: 'Mode',
    gradient: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    description: 'Soldes saisonnières fashion',
  },
  {
    id: 'programme-fitness',
    name: 'Programme Fitness',
    category: 'Sport',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    description: "Programme d'entraînement",
  },
  {
    id: 'story-produit',
    name: 'Story Produit',
    category: 'E-commerce',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
    description: 'Mise en avant produit story',
  },
  {
    id: 'carte-de-visite',
    name: 'Carte de Visite',
    category: 'Professionnel',
    gradient: 'bg-gradient-to-br from-zinc-600 to-zinc-800',
    description: 'Carte de visite moderne',
  },
  {
    id: 'evenement',
    name: 'Événement',
    category: 'Événementiel',
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    description: 'Invitation événement',
  },
] as const;

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Partez d&apos;un modèle pour aller plus vite.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Rechercher un template…"
            className="pl-9"
            aria-label="Rechercher un template"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={cn(
              'text-sm font-medium transition-colors',
              cat === 'Tous'
                ? 'rounded-full bg-primary px-4 py-1.5 text-primary-foreground'
                : 'rounded-full border border-border bg-background px-4 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.id} className="gap-0 overflow-hidden p-0 py-0 ring-foreground/10">
            <div
              className={cn(
                'aspect-[4/5] w-full rounded-t-xl bg-muted',
                t.gradient
              )}
              aria-hidden
            />
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-base font-semibold">{t.name}</h2>
                <Badge variant="secondary">{t.category}</Badge>
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">{t.description}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href={`/app/projects?new=true&template=${t.id}`} />}
              >
                Utiliser
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Affichage de 9 templates</p>
        <Button variant="outline" size="sm" type="button">
          Charger plus
        </Button>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type PageProps = {
  params: Promise<{ brandKitId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandKitId } = await params;
  return {
    title: `Sneakers Pro · Brand Kit`,
    description: `Brand kit ${brandKitId} — identité, palette et assets.`,
  };
}

const COLOR_SWATCHES = [
  { hex: '#4F46E5', className: 'bg-[#4F46E5]' },
  { hex: '#A855F7', className: 'bg-[#A855F7]' },
  { hex: '#FFFFFF', className: 'border border-border bg-[#FFFFFF]' },
  { hex: '#18181B', className: 'bg-[#18181B]' },
] as const;

const USAGE_PROJECTS = ['Campagne Q1 Sneakers', 'Stories Instagram', 'Flyer print A5'];

export default function BrandKitDetailPage() {
  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/app/brand-kits" />}
          className="-ml-2 h-auto px-2 text-muted-foreground hover:text-foreground"
        >
          ← Retour aux Brand Kits
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sneakers Pro</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identité de marque</CardTitle>
            <CardDescription>Informations utilisées pour guider la génération.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Nom</p>
              <p className="mt-0.5">Sneakers Pro</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="mt-0.5">Marque de sneakers premium pour jeunes adultes urbains</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Ton de marque</p>
              <p className="mt-0.5">Moderne, dynamique, audacieux</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Mots interdits</p>
              <p className="mt-0.5">cheap, discount, bas de gamme</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Palette de couleurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                {COLOR_SWATCHES.map((swatch) => (
                  <div key={swatch.hex} className="flex flex-col items-center gap-2">
                    <div
                      className={`size-12 shrink-0 rounded-lg shadow-sm ${swatch.className}`}
                      aria-hidden
                    />
                    <span className="font-mono text-xs text-muted-foreground">{swatch.hex}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Polices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Titre :</span> Inter Bold
              </p>
              <p>
                <span className="text-muted-foreground">Corps :</span> Inter Regular
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Aucun logo uploadé</p>
                <Button variant="outline" size="sm" type="button">
                  Uploader un logo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Utilisé dans 3 projets</h2>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {USAGE_PROJECTS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

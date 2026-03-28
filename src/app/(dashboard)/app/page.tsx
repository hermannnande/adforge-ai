import {
  Download,
  FileText,
  FolderOpen,
  ImageIcon,
  Layout,
  MoreHorizontal,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const recentProjects = [
  {
    id: 'mock-1',
    name: 'Campagne Sneakers Pro',
    platform: 'Facebook Ads',
    date: 'il y a 2 jours',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'mock-2',
    name: 'Menu Restaurant',
    platform: 'Flyer Print',
    date: 'il y a 2 jours',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'mock-3',
    name: 'Sérum Beauté',
    platform: 'Instagram Story',
    date: 'il y a 2 jours',
    gradient: 'from-pink-500 to-rose-500',
  },
] as const;

const hasProjects = recentProjects.length > 0;
const creditsTotal = 120;
const creditsUsed = 47;
const creditsProgress = Math.round((creditsUsed / creditsTotal) * 100);

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Bonjour 👋</h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/app/projects?new=true" />}
          className="shrink-0"
        >
          Nouveau projet
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projets actifs
            </CardTitle>
            <FolderOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">3</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              +1 cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crédits disponibles
            </CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">47 / 120</p>
            <p className="text-xs text-muted-foreground">Plan Starter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Générations ce mois
            </CardTitle>
            <ImageIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">18</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              +5 vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exports
            </CardTitle>
            <Download className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">12</p>
            <p className="text-xs text-muted-foreground">3 cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Link
            href="/app/projects?new=true&platform=facebook"
            className={cn(
              'flex gap-3 rounded-xl border border-border p-4 transition-colors',
              'hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Layout className="size-5 text-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-snug">
                Créer une affiche Facebook
              </p>
              <p className="text-sm text-muted-foreground">
                Format optimisé pour les publicités feed.
              </p>
            </div>
          </Link>

          <Link
            href="/app/projects?new=true&platform=instagram"
            className={cn(
              'flex gap-3 rounded-xl border border-border p-4 transition-colors',
              'hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Smartphone className="size-5 text-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-snug">Story Instagram</p>
              <p className="text-sm text-muted-foreground">
                Story verticale prête à publier.
              </p>
            </div>
          </Link>

          <Link
            href="/app/projects?new=true&platform=flyer"
            className={cn(
              'flex gap-3 rounded-xl border border-border p-4 transition-colors',
              'hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-5 text-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="font-medium leading-snug">Flyer promotionnel</p>
              <p className="text-sm text-muted-foreground">
                Flyer A5 ou A4 pour impression.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Projets récents
          </h2>
          <Link
            href="/app/projects"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {hasProjects ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10"
              >
                <div
                  className={cn(
                    'aspect-[4/3] w-full rounded-t-xl bg-gradient-to-br',
                    project.gradient
                  )}
                />
                <CardContent className="space-y-3 p-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="font-semibold leading-snug hover:text-primary hover:underline"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {project.date}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 shrink-0"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions du projet</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem nativeButton={false} render={<Link href={`/app/projects/${project.id}`} />}>
                          Ouvrir
                        </DropdownMenuItem>
                        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge variant="secondary">{project.platform}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium">Aucun projet pour le moment</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier projet pour commencer à générer des visuels.
            </p>
            <Button
              className="mt-4"
              size="sm"
              nativeButton={false}
              render={<Link href="/app/projects?new=true" />}
            >
              Créer un projet
            </Button>
          </div>
        )}
      </section>

      {/* Credits usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Utilisation des crédits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={creditsProgress} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {creditsUsed} / {creditsTotal} crédits utilisés ce mois
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Acheter des crédits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

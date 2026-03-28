'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  Download,
  FileText,
  FolderOpen,
  ImageIcon,
  Layout,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DashboardData {
  firstName: string;
  projectsCount: number;
  projectsThisWeek: number;
  balance: number;
  creditsTotal: number;
  planLabel: string;
  generationsThisMonth: number;
  genSubtitle: string;
  exportsCount: number;
  exportsThisWeek: number;
  monthlyBurn: number;
  creditsProgress: number;
  recentProjects: {
    id: string;
    name: string;
    platform: string;
    date: string;
    gradient: string;
  }[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function DashboardPage() {
  const { getToken, sessionId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setError(null);

    authFetch('/api/dashboard', { getToken, userId: user?.id, sessionId })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body}`);
        }
        return res.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getToken, isLoaded, isSignedIn, sessionId, user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-xl border border-border bg-card p-10 shadow-sm">
          <Sparkles className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Configuration en cours...</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Votre espace de travail est en cours de création.
            Rafraîchissez la page dans un instant.
          </p>
          {error && (
            <p className="mt-2 max-w-md text-xs text-destructive">{error}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour{data.firstName ? ` ${data.firstName}` : ''} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité.
          </p>
        </div>
        <Link
          href="/app/projects?new=true"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Nouveau projet
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projets actifs
            </CardTitle>
            <FolderOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">
              {data.projectsCount}
            </p>
            <p
              className={cn(
                'text-xs',
                data.projectsThisWeek > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            >
              {data.projectsThisWeek > 0
                ? `+${data.projectsThisWeek} cette semaine`
                : 'Aucun nouveau cette semaine'}
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
            <p className="text-2xl font-bold tabular-nums">
              {data.balance} / {data.creditsTotal}
            </p>
            <p className="text-xs text-muted-foreground">{data.planLabel}</p>
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
            <p className="text-2xl font-bold tabular-nums">
              {data.generationsThisMonth}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.genSubtitle}
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
            <p className="text-2xl font-bold tabular-nums">
              {data.exportsCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.exportsThisWeek > 0
                ? `${data.exportsThisWeek} cette semaine`
                : 'Aucun cette semaine'}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Link
            href="/app/projects?new=true&platform=facebook"
            className={cn(
              'flex gap-3 rounded-xl border border-border p-4 transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
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
              'hover:border-primary/50 hover:bg-primary/5',
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
              'hover:border-primary/50 hover:bg-primary/5',
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

        {data.recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recentProjects.map((project) => (
              <Card
                key={project.id}
                className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10"
              >
                <div
                  className={cn(
                    'aspect-[4/3] w-full rounded-t-xl bg-gradient-to-br',
                    project.gradient,
                  )}
                />
                <CardContent className="space-y-3 p-4 pt-4">
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/app/projects/${project.id}`}
                      className="font-semibold leading-snug hover:text-primary hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(project.date)}
                    </p>
                  </div>
                  <Badge variant="secondary">{project.platform}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium">
              Aucun projet pour le moment
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier projet pour commencer à générer des visuels.
            </p>
            <Link
              href="/app/projects?new=true"
              className="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Créer un projet
            </Link>
          </div>
        )}
      </section>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Utilisation des crédits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={data.creditsProgress} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {data.monthlyBurn} / {data.creditsTotal} crédits utilisés ce mois
            </p>
            <Link
              href="/app/billing"
              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Acheter des crédits
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

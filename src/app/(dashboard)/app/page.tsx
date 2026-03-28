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
import { prisma } from '@/lib/db/prisma';
import { cn } from '@/lib/utils';
import { userService } from '@/server/services/user.service';
import type { PlatformTarget } from '@prisma/client';

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

const PROJECT_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
] as const;

const PLATFORM_LABELS: Record<PlatformTarget, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  INSTAGRAM_FEED: 'Instagram Feed',
  INSTAGRAM_STORY: 'Instagram Story',
  TIKTOK_ADS: 'TikTok Ads',
  WHATSAPP_STATUS: 'WhatsApp',
  BANNER_WEB: 'Bannière web',
  FLYER_PRINT: 'Flyer Print',
  CUSTOM: 'Personnalisé',
};

function platformLabel(platform: PlatformTarget | null | undefined): string {
  if (!platform) return 'Projet';
  return PLATFORM_LABELS[platform] ?? platform;
}

function startOfWeekMonday(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  let user;
  let ctx;

  try {
    user = await userService.requireCurrentUser();
    ctx = await userService.requireCurrentWorkspace();
  } catch {
    return <DashboardSetupFallback />;
  }

  const workspaceId = ctx.workspace.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = startOfWeekMonday(now);
  const y = now.getFullYear();
  const m = now.getMonth();
  const startOfPrevMonth = new Date(y, m - 1, 1);
  const startOfCurrMonth = new Date(y, m, 1);

  const walletFromCtx = ctx.wallet;

  const [
    projectsCount,
    recentProjectsRaw,
    wallet,
    generationsThisMonth,
    exportsCount,
    subscription,
    projectsThisWeek,
    generationsLastMonth,
    exportsThisWeek,
    monthlyBurnAgg,
  ] = await Promise.all([
    prisma.project.count({
      where: { workspaceId, deletedAt: null },
    }),
    prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: { settings: true },
    }),
    walletFromCtx
      ? Promise.resolve(walletFromCtx)
      : prisma.creditWallet.findFirst({ where: { workspaceId } }),
    prisma.aiJob.count({
      where: {
        workspaceId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.generatedImage.count({
      where: { project: { workspaceId, deletedAt: null } },
    }),
    prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    }),
    prisma.project.count({
      where: {
        workspaceId,
        deletedAt: null,
        createdAt: { gte: weekStart },
      },
    }),
    prisma.aiJob.count({
      where: {
        workspaceId,
        createdAt: { gte: startOfPrevMonth, lt: startOfCurrMonth },
      },
    }),
    prisma.generatedImage.count({
      where: {
        project: { workspaceId, deletedAt: null },
        createdAt: { gte: weekStart },
      },
    }),
    prisma.creditLedgerEntry.aggregate({
      where: {
        wallet: { workspaceId },
        type: 'BURN',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  const balance = wallet?.balance ?? 0;
  const creditsTotal = subscription?.plan.credits ?? 20;
  const planLabel = subscription?.plan.name ?? 'Plan Gratuit';
  const monthlyBurn = monthlyBurnAgg._sum.amount ?? 0;
  const creditsProgress = Math.min(
    100,
    Math.round((monthlyBurn / Math.max(creditsTotal, 1)) * 100),
  );

  const genDelta = generationsThisMonth - generationsLastMonth;
  const genSubtitle =
    genDelta > 0
      ? `+${genDelta} vs mois dernier`
      : genDelta < 0
        ? `${genDelta} vs mois dernier`
        : 'Stable vs mois dernier';

  const recentProjects = recentProjectsRaw.map((project, index) => ({
    id: project.id,
    name: project.name,
    platform: platformLabel(project.settings?.platform),
    date: relativeTime(project.updatedAt),
    gradient: PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length]!,
  }));

  const hasProjects = recentProjects.length > 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour{user.firstName ? ` ${user.firstName}` : ''} 👋
          </h1>
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
            <p className="text-2xl font-bold tabular-nums">{projectsCount}</p>
            <p
              className={cn(
                'text-xs',
                projectsThisWeek > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            >
              {projectsThisWeek > 0
                ? `+${projectsThisWeek} cette semaine`
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
              {balance} / {creditsTotal}
            </p>
            <p className="text-xs text-muted-foreground">{planLabel}</p>
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
              {generationsThisMonth}
            </p>
            <p
              className={cn(
                'text-xs',
                genDelta > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            >
              {genSubtitle}
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
            <p className="text-2xl font-bold tabular-nums">{exportsCount}</p>
            <p className="text-xs text-muted-foreground">
              {exportsThisWeek > 0
                ? `${exportsThisWeek} cette semaine`
                : 'Aucun cette semaine'}
            </p>
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
                    project.gradient,
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
                        <DropdownMenuItem
                          nativeButton={false}
                          render={
                            <Link href={`/app/projects/${project.id}`} />
                          }
                        >
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
              {monthlyBurn} / {creditsTotal} crédits utilisés ce mois
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

function DashboardSetupFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-xl border border-border bg-card p-10 shadow-sm">
        <Sparkles className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 text-xl font-bold">Configuration en cours...</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Votre espace de travail est en cours de creation. Cela peut prendre
          quelques secondes. Rafraichissez la page dans un instant.
        </p>
        <Button className="mt-6" nativeButton={false} render={<Link href="/app" />}>
          Rafraichir
        </Button>
      </div>
    </div>
  );
}

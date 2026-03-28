import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BarChart3, CreditCard, Users, Zap } from 'lucide-react';

const ACTIVITY = [
  { initials: 'JD', text: 'Jean Dupont a créé un projet', time: 'il y a 2 min' },
  { initials: 'MK', text: 'Marie Koné a souscrit au plan Pro', time: 'il y a 15 min' },
  { initials: 'AS', text: 'Amadou Sow a généré 3 visuels', time: 'il y a 32 min' },
  { initials: 'FT', text: 'Fatou Touré a payé via Orange Money', time: 'il y a 1h' },
  { initials: 'PD', text: 'Pierre Diallo a signalé un contenu', time: 'il y a 2h' },
  { initials: 'NK', text: "N'Golo Kouyaté a exporté un pack", time: 'il y a 3h' },
] as const;

const PLAN_ROWS = [
  { name: 'Starter', pct: 89, users: 432, barClass: 'bg-primary' },
  { name: 'Pro', pct: 8, users: 39, barClass: 'bg-amber-500' },
  { name: 'Studio', pct: 3, users: 15, barClass: 'bg-emerald-500' },
] as const;

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Administration
          </h1>
          <Badge variant="secondary">Production</Badge>
        </div>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
            <Users className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">1,247</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              +32 cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abonnements actifs
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">486</p>
            <p className="text-xs text-muted-foreground">
              89% Starter, 8% Pro, 3% Studio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jobs IA (24h)
            </CardTitle>
            <Zap className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">3,891</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              98.2% succès
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus (mois)
            </CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">2,847,300 FCFA</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y divide-border">
              {ACTIVITY.map((item) => (
                <li
                  key={`${item.initials}-${item.time}`}
                  className="flex items-start gap-3 px-4 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar size="sm" className="mt-0.5">
                    <AvatarFallback className="text-[10px] font-semibold">
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des plans</CardTitle>
            <CardDescription>Abonnements actifs par offre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {PLAN_ROWS.map((row) => (
              <div key={row.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.users} users
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${row.barClass} transition-all`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{row.pct}%</p>
              </div>
            ))}
            <Separator />
            <p className="text-sm font-medium">
              Taux de conversion trial→paid :{' '}
              <span className="tabular-nums text-primary">24%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Santé du système
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden
                />
                <CardTitle className="text-base">API IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                Opérationnel
              </p>
              <p>Latence: 1.2s</p>
              <p>Uptime: 99.8%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden
                />
                <CardTitle className="text-base">Base de données</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                Opérationnel
              </p>
              <p>Connexions: 12/100</p>
              <p>Taille: 2.4 GB</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden
                />
                <CardTitle className="text-base">Paiements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                Opérationnel
              </p>
              <p>Stripe: OK</p>
              <p>CinetPay: OK</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

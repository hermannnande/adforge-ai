import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

const DAILY_GEN = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 185 },
  { label: 'Wed', value: 210 },
  { label: 'Thu', value: 190 },
  { label: 'Fri', value: 250 },
  { label: 'Sat', value: 180 },
  { label: 'Sun', value: 95 },
] as const;

const MAX_BAR = Math.max(...DAILY_GEN.map((d) => d.value));

const REVENUE_ROWS = [
  {
    name: 'Stripe',
    pct: 65,
    amount: '1,850,745 FCFA',
    barClass: 'bg-primary',
  },
  {
    name: 'CinetPay (Mobile Money)',
    pct: 35,
    amount: '996,555 FCFA',
    barClass: 'bg-sky-500',
  },
] as const;

const TOP_CREATORS: Array<{
  name: string;
  generations: number;
  creditsUsed: number;
  plan: string;
}> = [
  { name: 'Amadou Sow', generations: 1840, creditsUsed: 9200, plan: 'Studio' },
  { name: 'Marie Koné', generations: 1420, creditsUsed: 7100, plan: 'Pro' },
  { name: 'Salimata Bamba', generations: 980, creditsUsed: 4900, plan: 'Studio' },
  { name: 'Awa Diop', generations: 756, creditsUsed: 3780, plan: 'Pro' },
  { name: 'Pierre Diallo', generations: 612, creditsUsed: 3060, plan: 'Pro' },
];

function PlanBadgeAnalytics({ plan }: { plan: string }) {
  if (plan === 'Studio') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
      >
        {plan}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-200"
    >
      {plan}
    </Badge>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Métriques clés de la plateforme
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">24%</p>
            <p className="text-xs text-muted-foreground">Trial → Paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenu moyen / user
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">5,850 FCFA</p>
            <p className="text-xs text-muted-foreground">ARPU mensuel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rétention 30j
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">78%</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              +3% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crédits consommés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">45,230</p>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Générations par jour</CardTitle>
            <CardDescription>7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end justify-between gap-2 sm:gap-3">
              {DAILY_GEN.map((day) => {
                const h = Math.round((day.value / MAX_BAR) * 100);
                return (
                  <div
                    key={day.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-md bg-primary transition-all"
                        style={{ height: `${h}%`, minHeight: '4px' }}
                        title={`${day.value} générations`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                      {day.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                      {day.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus par provider</CardTitle>
            <CardDescription>Répartition du chiffre d&apos;affaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {REVENUE_ROWS.map((row) => (
              <div key={row.name} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.amount}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${row.barClass}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{row.pct}%</p>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">2,847,300 FCFA</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top créateurs</CardTitle>
          <CardDescription>
            Utilisateurs les plus actifs sur la période
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Générations</TableHead>
                <TableHead className="text-right">Crédits utilisés</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_CREATORS.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.generations.toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.creditsUsed.toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <PlanBadgeAnalytics plan={row.plan} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

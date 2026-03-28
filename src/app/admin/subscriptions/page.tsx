import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const activeBadgeClass =
  'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400';

const pausedBadgeClass =
  'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300';

const cancelledBadgeClass =
  'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-400';

const cinetProviderClass =
  'border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-200';

const PLAN_CARDS = [
  {
    name: 'Starter',
    actives: '432 actifs',
    price: '5,900 FCFA/mois',
    progress: 89,
    shareLabel: '89% du total',
    revenueBadge: null as string | null,
  },
  {
    name: 'Pro',
    actives: '39 actifs',
    price: '12,900 FCFA/mois',
    progress: 8,
    shareLabel: '8% du total',
    revenueBadge: 'Revenue: 503,100 FCFA',
  },
  {
    name: 'Studio',
    actives: '15 actifs',
    price: '29,900 FCFA/mois',
    progress: 3,
    shareLabel: '3% du total',
    revenueBadge: 'Revenue: 448,500 FCFA',
  },
] as const;

const FILTERS = ['Tous', 'Actifs', 'En pause', 'Annulés', 'Expirés'] as const;

const SUBSCRIPTIONS = [
  {
    workspace: 'Studio JD',
    plan: 'Starter',
    status: 'active' as const,
    provider: 'stripe' as const,
    start: '1 mars 2026',
    renewal: '1 avril 2026',
  },
  {
    workspace: 'Agence MK',
    plan: 'Pro',
    status: 'active' as const,
    provider: 'stripe' as const,
    start: '15 fév 2026',
    renewal: '15 mars 2026',
  },
  {
    workspace: 'Studio AS',
    plan: 'Studio',
    status: 'active' as const,
    provider: 'cinetpay' as const,
    start: '1 janv 2026',
    renewal: '1 avril 2026',
  },
  {
    workspace: 'Boutique FT',
    plan: 'Starter',
    status: 'paused' as const,
    provider: 'cinetpay' as const,
    start: '10 déc 2025',
    renewal: '—',
  },
  {
    workspace: 'Agence PD',
    plan: 'Pro',
    status: 'active' as const,
    provider: 'stripe' as const,
    start: '20 janv 2026',
    renewal: '20 avril 2026',
  },
  {
    workspace: 'Mode SB',
    plan: 'Studio',
    status: 'active' as const,
    provider: 'stripe' as const,
    start: '5 fév 2026',
    renewal: '5 avril 2026',
  },
  {
    workspace: 'Tech OT',
    plan: 'Starter',
    status: 'cancelled' as const,
    provider: 'cinetpay' as const,
    start: '1 nov 2025',
    renewal: '—',
  },
  {
    workspace: 'Food IK',
    plan: 'Starter',
    status: 'active' as const,
    provider: 'stripe' as const,
    start: '15 mars 2026',
    renewal: '15 avril 2026',
  },
] as const;

function SubscriptionStatusBadge({
  status,
}: {
  status: 'active' | 'paused' | 'cancelled';
}) {
  if (status === 'active') {
    return (
      <Badge variant="outline" className={cn(activeBadgeClass)}>
        Actif
      </Badge>
    );
  }
  if (status === 'paused') {
    return (
      <Badge variant="outline" className={cn(pausedBadgeClass)}>
        En pause
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn(cancelledBadgeClass)}>
      Annulé
    </Badge>
  );
}

function ProviderCell({ provider }: { provider: 'stripe' | 'cinetpay' }) {
  if (provider === 'stripe') {
    return <span className="text-sm">Stripe</span>;
  }
  return (
    <Badge variant="outline" className={cn(cinetProviderClass, 'font-normal')}>
      CinetPay
    </Badge>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Abonnements</h1>
        <Badge variant="secondary">486 actifs</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_CARDS.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  {plan.actives}
                </CardDescription>
                <p className="text-sm text-muted-foreground">{plan.price}</p>
              </div>
              {plan.revenueBadge ? (
                <CardAction>
                  <Badge variant="secondary" className="max-w-full text-[10px] leading-tight sm:text-xs">
                    {plan.revenueBadge}
                  </Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={plan.progress} aria-label={`Part ${plan.name}`} />
              <p className="text-xs text-muted-foreground">{plan.shareLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((label) => {
          const active = label === 'Tous';
          return (
            <span
              key={label}
              className={cn(
                'inline-flex cursor-default items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground',
              )}
            >
              {label}
            </span>
          );
        })}
      </div>

      <Card className="py-0">
        <CardContent className="px-0 pt-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Prochain renouvellement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUBSCRIPTIONS.map((row) => (
                <TableRow key={row.workspace}>
                  <TableCell className="font-medium">{row.workspace}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell>
                    <SubscriptionStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <ProviderCell provider={row.provider} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.start}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.renewal}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" type="button">
                      Gérer
                    </Button>
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

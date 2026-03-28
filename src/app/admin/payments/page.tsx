import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const successBadgeClass =
  'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400';

const pendingBadgeClass =
  'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300';

const failedBadgeClass =
  'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-400';

const cinetPayBadgeClass =
  'border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-200';

const STATS = [
  {
    label: 'Total (mois)',
    primary: '2,847,300 FCFA',
    secondary: null as string | null,
    highlight: true,
  },
  {
    label: 'Stripe',
    primary: '1,850,745 FCFA',
    secondary: '65%',
    highlight: false,
  },
  {
    label: 'CinetPay',
    primary: '996,555 FCFA',
    secondary: '35%',
    highlight: false,
  },
  {
    label: 'Remboursements',
    primary: '12,500 FCFA',
    secondary: '0.4%',
    highlight: false,
  },
] as const;

const FILTERS = ['Tous', 'Réussis', 'En attente', 'Échoués', 'Remboursés'] as const;

const PAYMENTS = [
  {
    id: 'pay_1a2b',
    workspace: 'Studio JD',
    amount: '5,900 FCFA',
    provider: 'stripe' as const,
    type: 'Abonnement',
    status: 'succeeded' as const,
    date: '28 mars 2026',
  },
  {
    id: 'pay_3c4d',
    workspace: 'Agence MK',
    amount: '12,900 FCFA',
    provider: 'stripe' as const,
    type: 'Abonnement',
    status: 'succeeded' as const,
    date: '28 mars 2026',
  },
  {
    id: 'cinet_5e6f',
    workspace: 'Boutique FT',
    amount: '5,900 FCFA',
    provider: 'cinetpay' as const,
    type: 'Abonnement',
    status: 'succeeded' as const,
    date: '27 mars 2026',
  },
  {
    id: 'pay_7g8h',
    workspace: 'Sport NK',
    amount: '2,900 FCFA',
    provider: 'stripe' as const,
    type: 'Top-up',
    status: 'succeeded' as const,
    date: '27 mars 2026',
  },
  {
    id: 'cinet_9i0j',
    workspace: 'Mode SB',
    amount: '29,900 FCFA',
    provider: 'cinetpay' as const,
    type: 'Abonnement',
    status: 'succeeded' as const,
    date: '26 mars 2026',
  },
  {
    id: 'pay_ab12',
    workspace: 'Studio AS',
    amount: '7,500 FCFA',
    provider: 'stripe' as const,
    type: 'Top-up',
    status: 'succeeded' as const,
    date: '26 mars 2026',
  },
  {
    id: 'cinet_cd34',
    workspace: 'Tech OT',
    amount: '5,900 FCFA',
    provider: 'cinetpay' as const,
    type: 'Abonnement',
    status: 'pending' as const,
    date: '25 mars 2026',
  },
  {
    id: 'pay_ef56',
    workspace: 'Agence PD',
    amount: '19,900 FCFA',
    provider: 'stripe' as const,
    type: 'Top-up',
    status: 'succeeded' as const,
    date: '25 mars 2026',
  },
  {
    id: 'cinet_gh78',
    workspace: 'Beauté AD',
    amount: '12,900 FCFA',
    provider: 'cinetpay' as const,
    type: 'Abonnement',
    status: 'failed' as const,
    date: '24 mars 2026',
  },
  {
    id: 'pay_ij90',
    workspace: 'Food IK',
    amount: '2,900 FCFA',
    provider: 'stripe' as const,
    type: 'Top-up',
    status: 'succeeded' as const,
    date: '24 mars 2026',
  },
] as const;

function StatusBadge({ status }: { status: 'succeeded' | 'pending' | 'failed' }) {
  if (status === 'succeeded') {
    return (
      <Badge variant="outline" className={cn(successBadgeClass)}>
        Réussi
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="outline" className={cn(pendingBadgeClass)}>
        En attente
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn(failedBadgeClass)}>
      Échoué
    </Badge>
  );
}

function ProviderBadge({ provider }: { provider: 'stripe' | 'cinetpay' }) {
  if (provider === 'stripe') {
    return <Badge>Stripe</Badge>;
  }
  return (
    <Badge variant="outline" className={cn(cinetPayBadgeClass)}>
      CinetPay
    </Badge>
  );
}

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivi de toutes les transactions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p
                className={cn(
                  'text-xl font-bold tabular-nums tracking-tight',
                  stat.highlight &&
                    'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {stat.primary}
              </p>
              {stat.secondary ? (
                <p className="text-sm text-muted-foreground">{stat.secondary}</p>
              ) : null}
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
                <TableHead>ID</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAYMENTS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.workspace}</TableCell>
                  <TableCell className="tabular-nums">{row.amount}</TableCell>
                  <TableCell>
                    <ProviderBadge provider={row.provider} />
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" type="button">
                      Détails
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

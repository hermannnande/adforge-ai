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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const SUMMARY = [
  { label: 'Crédits en circulation', value: '58,420' },
  { label: 'Crédits consommés (mois)', value: '45,230' },
  { label: 'Crédits expirés (mois)', value: '3,180' },
] as const;

const WALLETS = [
  {
    workspace: 'Studio Créatif JD',
    balance: 47,
    allocated: 120,
    consumed: 73,
    plan: 'Starter',
    lastActivity: 'il y a 2h',
  },
  {
    workspace: 'Agence MK',
    balance: 210,
    allocated: 350,
    consumed: 140,
    plan: 'Pro',
    lastActivity: 'il y a 15 min',
  },
  {
    workspace: 'Studio AS',
    balance: 890,
    allocated: 1000,
    consumed: 110,
    plan: 'Studio',
    lastActivity: 'il y a 1h',
  },
  {
    workspace: 'Boutique FT',
    balance: 0,
    allocated: 120,
    consumed: 120,
    plan: 'Starter',
    lastActivity: 'il y a 3 jours',
  },
  {
    workspace: 'Agence PD',
    balance: 180,
    allocated: 350,
    consumed: 170,
    plan: 'Pro',
    lastActivity: 'il y a 5h',
  },
  {
    workspace: 'Sport NK',
    balance: 95,
    allocated: 120,
    consumed: 25,
    plan: 'Starter',
    lastActivity: 'il y a 30 min',
  },
  {
    workspace: 'Mode SB',
    balance: 450,
    allocated: 1000,
    consumed: 550,
    plan: 'Studio',
    lastActivity: 'il y a 2 jours',
  },
  {
    workspace: 'Tech OT',
    balance: 20,
    allocated: 120,
    consumed: 100,
    plan: 'Starter',
    lastActivity: 'il y a 1 semaine',
  },
] as const;

function balanceClassName(balance: number, allocated: number): string {
  if (allocated <= 0) {
    return 'font-medium tabular-nums text-red-600 dark:text-red-400';
  }
  const ratio = (balance / allocated) * 100;
  if (ratio > 50) {
    return 'font-medium tabular-nums text-emerald-600 dark:text-emerald-400';
  }
  if (ratio >= 10) {
    return 'font-medium tabular-nums text-amber-600 dark:text-amber-400';
  }
  return 'font-medium tabular-nums text-red-600 dark:text-red-400';
}

export default function AdminWalletsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Wallets</h1>
          <Badge variant="secondary">486 wallets actifs</Badge>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          nativeButton={false}
          render={<Link href="/admin/wallets?action=grant" />}
        >
          Accorder des crédits
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUMMARY.map((item) => (
          <Card key={item.label} size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0">
        <CardContent className="px-0 pt-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Alloués</TableHead>
                <TableHead>Consommés</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WALLETS.map((row) => (
                <TableRow key={row.workspace}>
                  <TableCell className="font-medium">{row.workspace}</TableCell>
                  <TableCell
                    className={cn(balanceClassName(row.balance, row.allocated))}
                  >
                    {row.balance}
                  </TableCell>
                  <TableCell className="tabular-nums">{row.allocated}</TableCell>
                  <TableCell className="tabular-nums">{row.consumed}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.lastActivity}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" type="button">
                      Ajuster
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            1-8 sur 486
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

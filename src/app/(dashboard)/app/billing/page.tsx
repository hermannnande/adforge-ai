import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const metadata: Metadata = { title: 'Facturation' };

const successBadgeClass =
  'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400';

const CONSUMPTION = [
  { label: 'Générations Draft', value: '8 crédits' },
  { label: 'Générations Standard', value: '24 crédits' },
  { label: 'Générations Premium', value: '35 crédits' },
  { label: 'Suggestions IA', value: '0 crédits (gratuit)' },
  { label: 'Packs Multi-format', value: '6 crédits' },
] as const;

const INVOICES = [
  {
    date: '28 mars 2026',
    description: 'Abonnement Starter - Mars',
    amount: '5 900 FCFA',
  },
  {
    date: '28 fév 2026',
    description: 'Abonnement Starter - Février',
    amount: '5 900 FCFA',
  },
  {
    date: '15 fév 2026',
    description: 'Top-up 50 crédits',
    amount: '2 500 FCFA',
  },
] as const;

export default function BillingPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre abonnement et vos crédits.
        </p>
      </div>

      <Card className="border-2 border-primary shadow-sm ring-0">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl font-bold sm:text-2xl">Starter</CardTitle>
              <Badge variant="outline" className={cn(successBadgeClass)}>
                Actif
              </Badge>
            </div>
            <Button variant="outline" size="sm" type="button" className="shrink-0">
              Changer de plan
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">5 900 FCFA / mois</p>
            <p className="text-sm text-muted-foreground">
              Prochain renouvellement : 28 avril 2026
            </p>
            <p className="text-sm text-muted-foreground">120 crédits / mois inclus</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Solde de crédits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-primary">47</p>
            <p className="text-sm text-muted-foreground">crédits disponibles sur 120</p>
            <Progress value={39} aria-label="Utilisation des crédits du cycle" />
            <p className="text-xs text-muted-foreground">Expire le 28 avril 2026</p>
            <Button type="button">Acheter des crédits</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consommation ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/50">
              {CONSUMPTION.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 font-medium tabular-nums">{row.value}</span>
                </li>
              ))}
              <li className="py-2 text-sm font-bold">Total : 73 crédits</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Historique des factures</h2>
        <Card className="py-0">
          <CardContent className="px-0 pt-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((inv) => (
                  <TableRow key={`${inv.date}-${inv.description}`}>
                    <TableCell className="whitespace-nowrap">{inv.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate whitespace-normal">
                      {inv.description}
                    </TableCell>
                    <TableCell className="tabular-nums">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(successBadgeClass)}>
                        Payé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" type="button">
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Mobile Money (Orange Money)</p>
            <Button variant="outline" size="sm" type="button" className="shrink-0">
              Modifier
            </Button>
          </div>
          <Button variant="ghost" size="sm" type="button" className="gap-2 px-0 text-muted-foreground hover:text-foreground">
            <Plus className="size-4" />
            Ajouter une carte bancaire
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

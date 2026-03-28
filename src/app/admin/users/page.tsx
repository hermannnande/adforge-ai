import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Plan = 'Starter' | 'Pro' | 'Studio';

const USERS: Array<{
  initials: string;
  name: string;
  email: string;
  plan: Plan;
  creditsUsed: number;
  creditsMax: number;
  projects: number;
  lastSeen: string;
}> = [
  {
    initials: 'JD',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    plan: 'Starter',
    creditsUsed: 47,
    creditsMax: 120,
    projects: 3,
    lastSeen: 'il y a 2h',
  },
  {
    initials: 'MK',
    name: 'Marie Koné',
    email: 'marie@studio.ci',
    plan: 'Pro',
    creditsUsed: 210,
    creditsMax: 350,
    projects: 12,
    lastSeen: 'il y a 15 min',
  },
  {
    initials: 'AS',
    name: 'Amadou Sow',
    email: 'amadou@gmail.com',
    plan: 'Studio',
    creditsUsed: 890,
    creditsMax: 1000,
    projects: 28,
    lastSeen: 'il y a 1h',
  },
  {
    initials: 'FT',
    name: 'Fatou Touré',
    email: 'fatou@boutique.sn',
    plan: 'Starter',
    creditsUsed: 0,
    creditsMax: 120,
    projects: 1,
    lastSeen: 'il y a 3 jours',
  },
  {
    initials: 'PD',
    name: 'Pierre Diallo',
    email: 'pierre@agence.ml',
    plan: 'Pro',
    creditsUsed: 180,
    creditsMax: 350,
    projects: 8,
    lastSeen: 'il y a 5h',
  },
  {
    initials: 'NK',
    name: "N'Golo Kouyaté",
    email: 'ngolo@sport.ci',
    plan: 'Starter',
    creditsUsed: 95,
    creditsMax: 120,
    projects: 5,
    lastSeen: 'il y a 30 min',
  },
  {
    initials: 'SB',
    name: 'Salimata Bamba',
    email: 'salimata@mode.ci',
    plan: 'Studio',
    creditsUsed: 450,
    creditsMax: 1000,
    projects: 15,
    lastSeen: 'il y a 2 jours',
  },
  {
    initials: 'OT',
    name: 'Oumar Traoré',
    email: 'oumar@tech.bf',
    plan: 'Starter',
    creditsUsed: 20,
    creditsMax: 120,
    projects: 0,
    lastSeen: 'il y a 1 semaine',
  },
  {
    initials: 'AD',
    name: 'Awa Diop',
    email: 'awa@beaute.sn',
    plan: 'Pro',
    creditsUsed: 300,
    creditsMax: 350,
    projects: 10,
    lastSeen: 'il y a 4h',
  },
  {
    initials: 'IK',
    name: 'Ibrahim Keita',
    email: 'ibrahim@food.ml',
    plan: 'Starter',
    creditsUsed: 60,
    creditsMax: 120,
    projects: 2,
    lastSeen: 'il y a 6h',
  },
];

function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === 'Starter') {
    return <Badge variant="default">{plan}</Badge>;
  }
  if (plan === 'Pro') {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-200"
      >
        {plan}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
    >
      {plan}
    </Badge>
  );
}

function CreditsCell({
  used,
  max,
}: {
  used: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((used / max) * 100) : 0;
  return (
    <div className="flex w-[140px] flex-col gap-1.5">
      <span className="text-xs tabular-nums text-muted-foreground">
        {used}/{max}
      </span>
      <Progress
        value={pct}
        className="gap-0 [&_[data-slot=progress-track]]:h-1.5"
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Utilisateurs
          </h1>
          <Badge variant="secondary" className="tabular-nums">
            1,247
          </Badge>
        </div>
        <Button type="button" variant="outline" size="sm">
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4 border-b border-border pb-4">
          <div>
            <CardTitle className="text-base">Liste des comptes</CardTitle>
            <CardDescription>
              Recherche et filtres (données de démonstration)
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              type="search"
              placeholder="Rechercher par nom ou email..."
              className="max-w-md"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary">
                Tous
              </Button>
              <Button type="button" size="sm" variant="ghost">
                Actifs
              </Button>
              <Button type="button" size="sm" variant="ghost">
                Inactifs
              </Button>
              <Button type="button" size="sm" variant="ghost">
                Admin
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead className="text-right">Projets</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="w-[72px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map((u) => (
                <TableRow key={u.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback className="text-[10px] font-semibold">
                          {u.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={u.plan} />
                  </TableCell>
                  <TableCell>
                    <CreditsCell used={u.creditsUsed} max={u.creditsMax} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.projects}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.lastSeen}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-8"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions pour {u.name}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir</DropdownMenuItem>
                        <DropdownMenuItem>Modifier crédits</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Suspendre
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage{' '}
            <span className="font-medium text-foreground">1-10</span> sur{' '}
            <span className="tabular-nums font-medium text-foreground">
              1,247
            </span>
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <Button type="button" variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

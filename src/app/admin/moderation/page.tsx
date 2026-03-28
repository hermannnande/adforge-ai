import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const pendingItems = [
  {
    thumb: "bg-gradient-to-br from-indigo-500 to-purple-600",
    title: "sneakers-v3.png",
    user: "Jean Dupont",
    reason: "Contenu potentiellement trompeur",
    time: "il y a 5 min",
  },
  {
    thumb: "bg-gradient-to-br from-orange-500 to-red-600",
    title: "promo-extreme.png",
    user: "Oumar Traoré",
    reason: "Texte promotionnel excessif",
    time: "il y a 20 min",
  },
  {
    thumb: "bg-gradient-to-br from-pink-500 to-rose-600",
    title: "beauty-ad.png",
    user: "Awa Diop",
    reason: "Signalé par utilisateur",
    time: "il y a 1h",
  },
  {
    thumb: "bg-gradient-to-br from-blue-500 to-cyan-500",
    title: "fitness-promo.png",
    user: "Ibrahim Keita",
    reason: "Vérification automatique — confiance faible",
    time: "il y a 2h",
  },
] as const

const recentDecisions = [
  {
    thumb: "bg-gradient-to-br from-emerald-500 to-teal-600",
    user: "Camille Martin",
    decision: "approved" as const,
    reason: "Conforme aux guidelines",
    date: "28 mars 14:40",
  },
  {
    thumb: "bg-gradient-to-br from-zinc-400 to-zinc-700",
    user: "Luc Bernard",
    decision: "blocked" as const,
    reason: "Claims médicaux non sourcés",
    date: "28 mars 14:35",
  },
  {
    thumb: "bg-gradient-to-br from-violet-500 to-purple-700",
    user: "Fatou Sow",
    decision: "approved" as const,
    reason: "Revue manuelle OK",
    date: "28 mars 14:22",
  },
  {
    thumb: "bg-gradient-to-br from-amber-500 to-orange-600",
    user: "Thomas Petit",
    decision: "blocked" as const,
    reason: "Comparatif prix trompeur",
    date: "28 mars 14:10",
  },
  {
    thumb: "bg-gradient-to-br from-sky-500 to-blue-600",
    user: "Léa Garnier",
    decision: "approved" as const,
    reason: "Faux positif IA",
    date: "28 mars 13:58",
  },
]

export default function AdminModerationPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Modération
        </h1>
        <Badge variant="destructive">12 en attente</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-destructive/20 bg-destructive/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive text-sm font-medium">
              En attente de review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-destructive font-heading text-3xl font-semibold tabular-nums">
              12
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Approuvés (mois)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="font-heading text-3xl font-semibold tabular-nums">
              3,456
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Bloqués (mois)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="font-heading text-3xl font-semibold tabular-nums">
              23
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">File d&apos;attente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border p-0 px-4 pb-4">
          {pendingItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-center"
            >
              <div
                className={cn(
                  "size-16 shrink-0 rounded-lg shadow-inner",
                  item.thumb
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground text-sm">{item.user}</p>
                <p className="text-muted-foreground text-sm">{item.reason}</p>
                <p className="text-muted-foreground text-xs">{item.time}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Bloquer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-medium tracking-tight">
          Décisions récentes
        </h2>
        <Card className="shadow-none">
          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Décision</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDecisions.map((row) => (
                  <TableRow key={`${row.user}-${row.date}`}>
                    <TableCell>
                      <div
                        className={cn("size-10 rounded-md", row.thumb)}
                        aria-hidden
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.user}</TableCell>
                    <TableCell>
                      {row.decision === "approved" ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/35 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-400"
                        >
                          Approuvé
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="font-normal">
                          Bloqué
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {row.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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

const filterPills = [
  "Tous",
  "En cours",
  "Complétés",
  "Échoués",
  "Remboursés",
] as const

type JobRow = {
  id: string
  project: string
  type: string
  provider: "Replicate" | "OpenAI"
  quality: "Draft" | "Standard" | "Premium"
  duration: string
  credits: number
  status: "completed" | "running" | "failed" | "refunded"
  date: string
  dateAsBadge?: boolean
}

const jobs: JobRow[] = [
  {
    id: "job_a1",
    project: "Sneakers Pro",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Standard",
    duration: "3.2s",
    credits: 2,
    status: "completed",
    date: "28 mars 14:32",
  },
  {
    id: "job_b2",
    project: "Menu Napoli",
    type: "IMAGE_GEN",
    provider: "OpenAI",
    quality: "Premium",
    duration: "6.1s",
    credits: 5,
    status: "completed",
    date: "28 mars 14:28",
  },
  {
    id: "job_c3",
    project: "Sérum Beauté",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Draft",
    duration: "1.8s",
    credits: 1,
    status: "completed",
    date: "28 mars 14:25",
  },
  {
    id: "job_d4",
    project: "Villa Prestige",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Standard",
    duration: "—",
    credits: 2,
    status: "running",
    date: "28 mars 14:33",
  },
  {
    id: "job_e5",
    project: "Collection Été",
    type: "MULTI_FORMAT",
    provider: "Replicate",
    quality: "Standard",
    duration: "12.4s",
    credits: 8,
    status: "completed",
    date: "28 mars 14:20",
  },
  {
    id: "job_f6",
    project: "Coaching Fit",
    type: "IMAGE_GEN",
    provider: "OpenAI",
    quality: "Premium",
    duration: "—",
    credits: 5,
    status: "failed",
    date: "28 mars 14:15",
  },
  {
    id: "job_g7",
    project: "Promo Flash",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Draft",
    duration: "1.5s",
    credits: 1,
    status: "completed",
    date: "28 mars 14:10",
  },
  {
    id: "job_h8",
    project: "Story Beauté",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Standard",
    duration: "3.8s",
    credits: 2,
    status: "completed",
    date: "28 mars 14:05",
  },
  {
    id: "job_i9",
    project: "Carte Visite",
    type: "IMAGE_GEN",
    provider: "OpenAI",
    quality: "Standard",
    duration: "4.5s",
    credits: 2,
    status: "completed",
    date: "28 mars 14:00",
  },
  {
    id: "job_j0",
    project: "Event Invite",
    type: "IMAGE_GEN",
    provider: "Replicate",
    quality: "Draft",
    duration: "—",
    credits: 1,
    status: "refunded",
    date: "28 mars 13:55",
    dateAsBadge: true,
  },
]

function QualityBadge({ quality }: { quality: JobRow["quality"] }) {
  if (quality === "Draft") {
    return (
      <Badge
        variant="secondary"
        className="bg-muted/80 font-normal text-muted-foreground"
      >
        Draft
      </Badge>
    )
  }
  if (quality === "Premium") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 font-normal text-amber-800 dark:text-amber-200"
      >
        Premium
      </Badge>
    )
  }
  return <Badge variant="default">Standard</Badge>
}

function ProviderBadge({ provider }: { provider: JobRow["provider"] }) {
  if (provider === "Replicate") {
    return (
      <Badge
        variant="outline"
        className="border-violet-500/35 bg-violet-500/12 font-normal text-violet-700 dark:text-violet-300"
      >
        Replicate
      </Badge>
    )
  }
  return <Badge variant="default">OpenAI</Badge>
}

function StatusBadge({ status, pulse }: { status: JobRow["status"]; pulse?: boolean }) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/35 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-400"
        >
          Complété
        </Badge>
      )
    case "running":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-amber-400/50 bg-amber-400/20 font-normal text-amber-900 dark:text-amber-200",
            pulse && "animate-pulse"
          )}
        >
          En cours
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive" className="font-normal">
          Échoué
        </Badge>
      )
    case "refunded":
      return (
        <Badge variant="secondary" className="font-normal">
          Remboursé
        </Badge>
      )
    default:
      return null
  }
}

export default function AdminJobsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Jobs IA
          </h1>
          <Badge variant="secondary" className="tabular-nums">
            3,891 aujourd&apos;hui
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Complétés
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2 pt-0">
            <span className="font-heading text-2xl font-semibold tabular-nums">
              3,817
            </span>
            <Badge
              variant="outline"
              className="border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            >
              98.2%
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex flex-wrap items-end gap-2">
              <span className="font-heading text-2xl font-semibold tabular-nums">
                12
              </span>
              <Badge className="animate-pulse border-amber-400/40 bg-amber-400/25 font-normal text-amber-950 dark:text-amber-100">
                Live
              </Badge>
            </div>
            <Progress value={68} aria-label="Charge file d'attente" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Échoués
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2 pt-0">
            <span className="font-heading text-2xl font-semibold tabular-nums">
              58
            </span>
            <Badge variant="destructive" className="font-normal">
              1.5%
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Temps moyen
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2 pt-0">
            <span className="font-heading text-2xl font-semibold tabular-nums">
              4.2s
            </span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              −0.3s vs hier
            </span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2">
        {filterPills.map((label, i) => (
          <span
            key={label}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors",
              i === 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Jobs récents</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Qualité</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs">{job.id}</TableCell>
                  <TableCell className="font-medium">{job.project}</TableCell>
                  <TableCell className="font-mono text-xs">{job.type}</TableCell>
                  <TableCell>
                    <ProviderBadge provider={job.provider} />
                  </TableCell>
                  <TableCell>
                    <QualityBadge quality={job.quality} />
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {job.duration}
                  </TableCell>
                  <TableCell className="tabular-nums">{job.credits}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={job.status}
                      pulse={job.status === "running"}
                    />
                  </TableCell>
                  <TableCell>
                    {job.dateAsBadge ? (
                      <Badge variant="outline" className="font-normal">
                        {job.date}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {job.date}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

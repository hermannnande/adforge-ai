import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const filterPills = ["Tous", "Actifs", "Inactifs"] as const

const templates = [
  {
    name: "Promo Flash",
    category: "E-commerce",
    scope: "Global" as const,
    usage: 342,
    active: true,
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
  },
  {
    name: "Menu du Jour",
    category: "Restauration",
    scope: "Global" as const,
    usage: 128,
    active: true,
    gradient: "bg-gradient-to-br from-orange-500 to-red-600",
  },
  {
    name: "Nouveau Produit",
    category: "Beauté",
    scope: "Global" as const,
    usage: 256,
    active: true,
    gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
  },
  {
    name: "Bien Immobilier",
    category: "Immobilier",
    scope: "Global" as const,
    usage: 89,
    active: true,
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    name: "Soldes d'Été",
    category: "Mode",
    scope: "Global" as const,
    usage: 201,
    active: true,
    gradient: "bg-gradient-to-br from-amber-500 to-yellow-500",
  },
  {
    name: "Programme Fitness",
    category: "Sport",
    scope: "Global" as const,
    usage: 67,
    active: true,
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    name: "Story Produit",
    category: "E-commerce",
    scope: "Global" as const,
    usage: 178,
    active: true,
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    name: "Carte de Visite",
    category: "Pro",
    scope: "Global" as const,
    usage: 45,
    active: false,
    gradient: "bg-gradient-to-br from-zinc-400 to-zinc-800",
  },
] as const

export default function AdminTemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Templates
          </h1>
          <Badge variant="secondary">24 templates</Badge>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/templates/new" />}
        >
          Créer un template
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterPills.map((label, i) => (
            <span
              key={label}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium",
                i === 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="w-full sm:max-w-xs">
          <Input
            type="search"
            placeholder="Rechercher un template…"
            aria-label="Rechercher un template"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((t) => (
          <Card
            key={t.name}
            className="overflow-hidden shadow-none ring-1 ring-foreground/10"
          >
            <div
              className={cn("aspect-[4/5] w-full", t.gradient)}
              aria-hidden
            />
            <CardContent className="flex flex-col gap-3 pt-4">
              <div>
                <p className="font-heading font-medium leading-snug">{t.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="font-normal">
                    {t.category}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {t.scope}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm tabular-nums">
                {t.usage.toLocaleString("fr-FR")} utilisations
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    t.active ? "bg-emerald-500" : "bg-red-500"
                  )}
                  aria-hidden
                />
                <span className="text-muted-foreground">
                  {t.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                nativeButton={false}
                render={
                  <Link
                    href={`/admin/templates/${encodeURIComponent(t.name.toLowerCase().replace(/\s+/g, "-"))}`}
                  />
                }
              >
                Modifier
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          Affichage de 8 sur 24 templates
        </p>
        <Button variant="secondary" type="button">
          Charger plus
        </Button>
      </div>
    </div>
  )
}

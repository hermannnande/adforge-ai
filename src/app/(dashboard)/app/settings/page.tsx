import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export const metadata: Metadata = { title: "Paramètres" }

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-muted-foreground">
          Gérez votre compte et vos préférences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informations visibles sur votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            JD
          </div>
          <div className="grid gap-4 sm:max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="settings-fullname">Nom complet</Label>
              <Input id="settings-fullname" readOnly value="Jean Dupont" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                readOnly
                type="email"
                value="jean@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-company">Entreprise</Label>
              <Input id="settings-company" readOnly value="Studio Créatif" />
            </div>
          </div>
          <Button type="button" variant="outline">
            Modifier le profil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Espace de travail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Nom du workspace
            </span>
            <span className="text-sm">Mon Workspace</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Plan actuel
            </span>
            <Badge>Starter</Badge>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Membres
              </span>
              <p className="text-sm">1 membre</p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Inviter
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-muted-foreground">Langue</span>
            <span className="text-sm">Français</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Fuseau horaire
            </span>
            <span className="text-sm">Africa/Abidjan (UTC+0)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choisissez ce que vous souhaitez recevoir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Notifications par email</p>
              <p className="text-sm text-muted-foreground">
                Recevoir les alertes importantes par email.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Résumé hebdomadaire</p>
              <p className="text-sm text-muted-foreground">
                Un récapitulatif de votre activité chaque semaine.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Alertes crédits faibles</p>
              <p className="text-sm text-muted-foreground">
                Être averti lorsque vos crédits sont presque épuisés.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Nouveautés produit</p>
              <p className="text-sm text-muted-foreground">
                Découvrir les nouvelles fonctionnalités d&apos;AdForge AI.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Supprimer le compte</p>
            <p className="text-sm text-muted-foreground">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
          >
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

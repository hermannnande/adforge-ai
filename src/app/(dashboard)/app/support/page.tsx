import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, HelpCircle, PlayCircle } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Support" }

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="mt-1 text-muted-foreground">Nous sommes là pour vous aider.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-5" aria-hidden />
            </div>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Guides détaillés pour tirer le meilleur d&apos;AdForge AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline">
              Consulter la doc
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="size-5" aria-hidden />
            </div>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>Réponses aux questions les plus fréquentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/faq" />}
            >
              Voir la FAQ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PlayCircle className="size-5" aria-hidden />
            </div>
            <CardTitle>Tutoriels vidéo</CardTitle>
            <CardDescription>
              Apprenez à utiliser l&apos;outil en quelques minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline">
              Voir les tutoriels
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacter le support</CardTitle>
          <CardDescription>
            Décrivez votre demande, notre équipe vous répondra rapidement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-subject">Sujet</Label>
            <Input id="support-subject" placeholder="Ex: Problème de génération" />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div
              className={cn(
                "flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm text-muted-foreground dark:bg-input/30"
              )}
            >
              Sélectionner...
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              placeholder="Décrivez votre problème en détail..."
              rows={5}
            />
          </div>
          <Button type="button">Envoyer le message</Button>
          <p className="text-xs text-muted-foreground">
            Temps de réponse moyen : moins de 24h
          </p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="flex flex-col gap-2 pt-4">
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full bg-emerald-500"
              aria-hidden
            />
            <span className="text-sm font-medium">Tous les systèmes opérationnels</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : il y a 5 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
})

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "5 900",
    popular: false,
    cta: "Choisir Starter",
    features: [
      "120 crédits / mois",
      "Agent IA conversationnel",
      "Bibliothèque de projets",
      "1 Brand Kit",
      "Export standard",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "12 900",
    popular: true,
    cta: "Choisir Pro",
    features: [
      "350 crédits / mois",
      "Agent IA conversationnel",
      "Bibliothèque illimitée",
      "5 Brand Kits",
      "Pack multi-format",
      "Export HD",
      "Prompt Memory",
      "Support prioritaire",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: "29 900",
    popular: false,
    cta: "Choisir Studio",
    features: [
      "1 000 crédits / mois",
      "Agent IA conversationnel",
      "Bibliothèque illimitée",
      "Brand Kits illimités",
      "Pack multi-format",
      "Export HD + Print",
      "Prompt Memory",
      "Templates premium",
      "Accès anticipé",
      "Support dédié",
    ],
  },
] as const

export function PricingCards() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          {...fadeUp(0)}
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Commencez gratuitement avec 20 crédits offerts. Aucune carte
            requise.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 md:items-stretch md:gap-6 md:py-2">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={cn(
                "flex min-h-0",
                plan.popular && "md:z-10 md:-my-1 md:self-center"
              )}
              {...fadeUp(0.08 + index * 0.06)}
            >
              <Card
                className={cn(
                  "relative flex w-full flex-col border transition-shadow",
                  plan.popular &&
                    "border-primary ring-2 ring-primary shadow-lg md:scale-[1.04]"
                )}
              >
                {plan.popular ? (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <Badge className="shadow-sm">Populaire</Badge>
                  </div>
                ) : null}

                <CardHeader
                  className={cn("pt-8", plan.popular && "border-b pb-4")}
                >
                  <CardTitle className="text-lg font-semibold">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      FCFA
                    </span>
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-3">
                  <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto border-t bg-transparent pt-4">
                  <Link
                    href="/register"
                    className={cn(
                      "inline-flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
                      plan.popular
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-10 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          Tous les plans incluent 20 crédits d&apos;essai gratuits.
        </motion.p>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const EXAMPLES = [
  {
    emoji: "🛍️",
    title: "E-commerce",
    description:
      "Affiche promotionnelle pour des sneakers en solde, style premium",
    prompt:
      "Affiche promotionnelle pour des sneakers en solde, style premium",
  },
  {
    emoji: "🍕",
    title: "Restauration",
    description: "Flyer pour un nouveau restaurant italien, ambiance chaleureuse",
    prompt: "Flyer pour un nouveau restaurant italien, ambiance chaleureuse",
  },
  {
    emoji: "💄",
    title: "Beauté",
    description: "Story Instagram pour un sérum anti-âge, avant/après",
    prompt: "Story Instagram pour un sérum anti-âge, avant/après",
  },
] as const

const inView = {
  viewport: { once: true, margin: "-100px" } as const,
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
}

export function DemoPrompt() {
  const [value, setValue] = useState("")

  return (
    <section className="border-t border-border/40 bg-muted/20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          {...inView}
          transition={{ ...inView.transition, delay: 0 }}
        >
          Essayez maintenant
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-xl text-center text-base text-muted-foreground md:text-lg"
          {...inView}
          transition={{ ...inView.transition, delay: 0.08 }}
        >
          Décrivez votre besoin et laissez l&apos;IA faire le reste.
        </motion.p>

        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          {...inView}
          transition={{ ...inView.transition, delay: 0.16 }}
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-amber-500 p-[1px] shadow-lg shadow-primary/10">
            <div className="rounded-[calc(var(--radius-2xl)-1px)] bg-background p-1 sm:p-1.5">
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex. : une affiche verticale pour lancer une offre Black Friday sur mes logiciels B2B, tons sobres, CTA « Demander une démo »…"
                className="min-h-36 resize-y border-0 bg-transparent text-base shadow-none focus-visible:ring-0 md:min-h-40 md:text-base"
              />
              <div className="flex justify-end border-t border-border/50 px-2 py-2">
                <Button type="button" size="lg" className="h-10 px-6">
                  Générer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3"
          {...inView}
          transition={{ ...inView.transition, delay: 0.24 }}
        >
          {EXAMPLES.map((card, i) => (
            <motion.button
              key={card.title}
              type="button"
              onClick={() => setValue(card.prompt)}
              {...inView}
              transition={{ ...inView.transition, delay: 0.32 + i * 0.08 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "flex flex-col gap-2 rounded-xl border border-border/70 bg-background/90 p-5 text-left shadow-sm transition-colors",
                "hover:border-primary/35 hover:bg-background hover:shadow-md",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              )}
            >
              <span className="text-2xl" aria-hidden>
                {card.emoji}
              </span>
              <span className="font-semibold text-foreground">{card.title}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

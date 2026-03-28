"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne AdForge AI ?",
    a: "Décrivez simplement votre besoin publicitaire. Notre agent IA analyse votre brief, propose des angles créatifs, génère des accroches marketing, puis produit plusieurs visuels réalistes que vous pouvez éditer et exporter.",
  },
  {
    q: "Combien coûte la génération d'un visuel ?",
    a: "Un draft rapide coûte 1 crédit, une génération standard 2 crédits, et un rendu premium 5 crédits. Les suggestions texte et le brief sont gratuits.",
  },
  {
    q: "Puis-je essayer gratuitement ?",
    a: "Oui ! À l'inscription, vous recevez 20 crédits offerts sans carte bancaire requise. C'est suffisant pour tester plusieurs générations.",
  },
  {
    q: "Quels formats sont supportés ?",
    a: "Facebook Ads (1:1), Instagram Feed (4:5), Story (9:16), TikTok Ads (9:16), Bannière web (16:9), Flyer print (3:4). Vous pouvez aussi décliner un visuel en pack multi-format.",
  },
  {
    q: "Comment fonctionne le système de crédits ?",
    a: "Chaque plan inclut une allocation mensuelle de crédits. Vous pouvez aussi acheter des crédits supplémentaires (top-up). Les crédits mensuels non utilisés expirent en fin de mois.",
  },
  {
    q: "Puis-je payer par Mobile Money ?",
    a: "Oui, nous acceptons le paiement par Mobile Money (Orange Money, MTN, Moov, Wave) via CinetPay, en plus des cartes bancaires via Stripe.",
  },
  {
    q: "Mes projets sont-ils sauvegardés ?",
    a: "Oui, tous vos projets, conversations, images et exports sont sauvegardés dans votre bibliothèque. Vous pouvez reprendre un projet exactement où vous l'aviez laissé.",
  },
  {
    q: "Qu'est-ce qu'un Brand Kit ?",
    a: "Un Brand Kit enregistre votre identité visuelle : logo, couleurs, polices, ton de marque, mots interdits. L'IA l'utilise automatiquement pour garder vos visuels cohérents.",
  },
] as const

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="mb-12 text-center font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Questions fréquentes
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <ul className="divide-y divide-border border-y border-border">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <li key={item.q} className="border-border">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="flex w-full items-start justify-between gap-4 py-5 text-left text-foreground transition-colors hover:text-primary"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-medium leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

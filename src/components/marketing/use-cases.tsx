"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type PlatformCard = {
  id: string
  name: string
  dimensions: string
  ratio: string
  iconClass: string
}

const PLATFORMS: PlatformCard[] = [
  {
    id: "fb",
    name: "Facebook Ads",
    dimensions: "1080 × 1080",
    ratio: "1:1",
    iconClass: "bg-blue-600/90",
  },
  {
    id: "ig-feed",
    name: "Instagram Feed",
    dimensions: "1080 × 1350",
    ratio: "4:5",
    iconClass: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    id: "ig-story",
    name: "Instagram Story",
    dimensions: "1080 × 1920",
    ratio: "9:16",
    iconClass: "bg-gradient-to-br from-fuchsia-500 to-orange-400",
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    dimensions: "1080 × 1920",
    ratio: "9:16",
    iconClass: "bg-slate-900",
  },
  {
    id: "wa",
    name: "WhatsApp Status",
    dimensions: "1080 × 1920",
    ratio: "9:16",
    iconClass: "bg-emerald-600/90",
  },
  {
    id: "web",
    name: "Bannière Web",
    dimensions: "1920 × 1080",
    ratio: "16:9",
    iconClass: "bg-sky-600/90",
  },
  {
    id: "print",
    name: "Flyer Print",
    dimensions: "A4 / A5",
    ratio: "3:4",
    iconClass: "bg-amber-700/90",
  },
  {
    id: "multi",
    name: "Multi-format",
    dimensions: "Tous formats",
    ratio: "Auto",
    iconClass: "bg-gradient-to-br from-primary/80 to-violet-600/80",
  },
]

const ease = [0.22, 1, 0.36, 1] as const

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const blockVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
}

export function UseCases() {
  return (
    <section className="py-20 lg:py-28">
      <motion.div
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionVariants}
      >
        <motion.div className="text-center" variants={blockVariants}>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Créé pour vos plateformes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Des visuels optimisés pour chaque canal de diffusion.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          variants={gridVariants}
        >
          {PLATFORMS.map((p) => (
            <motion.article
              key={p.id}
              variants={cardVariants}
              className={cn(
                "rounded-xl border border-border p-4 text-center transition-colors hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "mx-auto mb-3 size-12 rounded-lg shadow-inner ring-1 ring-black/5 dark:ring-white/10",
                  p.iconClass
                )}
                aria-hidden
              />
              <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.dimensions}</p>
              <p className="text-xs font-medium text-muted-foreground/80">{p.ratio}</p>
              <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Optimisé
              </span>
            </motion.article>
          ))}
        </motion.div>

        <motion.p
          className="mt-10 text-center text-sm text-muted-foreground md:text-base"
          variants={blockVariants}
        >
          Déclinaison automatique : créez une fois, exportez partout.
        </motion.p>
      </motion.div>
    </section>
  )
}

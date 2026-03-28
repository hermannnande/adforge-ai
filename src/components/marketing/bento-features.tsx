"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useInView,
  type Variants,
} from "framer-motion"

import { cn } from "@/lib/utils"

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const CHAT_MESSAGES = [
  { side: "user" as const, text: "Crée une pub pour mes sneakers" },
  {
    side: "ai" as const,
    text: "Je propose 3 angles : premium, urbain, sportif...",
  },
  { side: "user" as const, text: "Montre-moi le style urbain" },
]

const BRAND_COLORS = [
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-cyan-400",
  "bg-amber-400",
]

const CREDIT_LINES = [
  "Draft — 1 crédit",
  "Standard — 2 crédits",
  "Premium — 5 crédits",
]

const LIBRARY_GRADS = [
  "from-violet-500/80 to-fuchsia-600/60",
  "from-cyan-500/70 to-blue-600/50",
  "from-amber-500/70 to-orange-600/50",
  "from-emerald-500/70 to-teal-600/50",
  "from-rose-500/70 to-pink-600/50",
  "from-indigo-500/70 to-violet-600/50",
]

const PLATFORMS = [
  { name: "Facebook", tag: "1:1 · 4:5" },
  { name: "Instagram", tag: "Feed · Story" },
  { name: "TikTok", tag: "9:16" },
  { name: "WhatsApp", tag: "Status" },
  { name: "Web", tag: "16:9" },
  { name: "Print", tag: "A4 · A5" },
]

function CountUpSeconds() {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(0, 4.2, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    })
    return () => ctrl.stop()
  }, [inView])

  return (
    <motion.span
      ref={ref}
      className="font-mono text-5xl font-semibold tracking-tight text-foreground tabular-nums md:text-6xl"
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {value.toFixed(1)}s
    </motion.span>
  )
}

export function BentoFeatures() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-[min(520px,70vw)] w-[min(520px,70vw)] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[min(400px,55vw)] w-[min(400px,55vw)] rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Tout ce qu&apos;il vous faut, rien de superflu
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Des outils pensés pour convertir, pas juste pour impressionner.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          {/* Row 1 — Agent IA + Multi-format */}
          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className={cn(
              "col-span-12 flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white shadow-xl md:col-span-7",
              "ring-1 ring-white/10"
            )}
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Agent IA Conversationnel
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Dialogue naturel, briefs qui deviennent des visuels.
            </p>
            <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
              {CHAT_MESSAGES.map((m, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg",
                    m.side === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto border border-white/10 bg-zinc-800/90 text-zinc-100"
                  )}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: i * 0.5,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="col-span-12 flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur-sm md:col-span-5"
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Multi-format automatique
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Un brief, trois déclinaisons prêtes à publier.
            </p>
            <div className="relative mt-auto flex min-h-[140px] items-center justify-center">
              {(
                [
                  {
                    label: "Facebook",
                    ratio: "aspect-square w-[72px]",
                    grad: "from-blue-500/90 to-indigo-600/70",
                    rot: -8,
                  },
                  {
                    label: "Instagram",
                    ratio: "aspect-[4/5] w-[64px]",
                    grad: "from-fuchsia-500/85 to-violet-600/65",
                    rot: 4,
                  },
                  {
                    label: "Story",
                    ratio: "aspect-[9/16] w-[52px]",
                    grad: "from-amber-500/80 to-rose-600/60",
                    rot: 14,
                  },
                ] as const
              ).map((item, i) => (
                <motion.div
                  key={item.label}
                  className="absolute flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, x: 24, y: 8, rotate: 0, scale: 0.85 }}
                  whileInView={{
                    opacity: 1,
                    x: (i - 1) * 38,
                    y: (i - 1) * -12,
                    rotate: item.rot,
                    scale: 1,
                  }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className={cn(
                      "rounded-lg border border-white/20 bg-gradient-to-br shadow-md",
                      item.ratio,
                      item.grad
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Row 2 — Brand kit, Rendu, Crédits */}
          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="col-span-12 flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-md backdrop-blur-sm md:col-span-4"
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Brand Kit intégré
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Couleurs et typo alignées sur votre charte.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {BRAND_COLORS.map((c, i) => (
                <motion.div
                  key={c}
                  className={cn(
                    "size-11 rounded-full shadow-md ring-2 ring-background",
                    c
                  )}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 380,
                    damping: 22,
                  }}
                />
              ))}
            </div>
            <motion.p
              className="mt-4 font-mono text-sm font-semibold text-foreground"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              Inter Bold
            </motion.p>
          </motion.div>

          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="col-span-12 flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md backdrop-blur-sm md:col-span-4"
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Rendu en secondes
            </h3>
            <div className="mt-4 flex flex-1 flex-col justify-center">
              <CountUpSeconds />
              <p className="mt-2 text-sm text-muted-foreground">
                Temps moyen de génération
              </p>
              <motion.div
                className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-cyan-400"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2.2,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="col-span-12 flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-md backdrop-blur-sm md:col-span-4"
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Crédits transparents
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Chaque option, un coût clair.
            </p>
            <ul className="mt-6 space-y-3">
              {CREDIT_LINES.map((line, i) => (
                <motion.li
                  key={line}
                  className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-sm font-medium"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + i * 0.12,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Row 3 — Bibliothèque + Export */}
          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="col-span-12 flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-md backdrop-blur-sm md:col-span-5"
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Bibliothèque persistante
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vos créations, toujours accessibles.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              {LIBRARY_GRADS.map((g, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg bg-gradient-to-br shadow-inner ring-1 ring-black/5 dark:ring-white/10",
                    g
                  )}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 400,
                    damping: 24,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className={cn(
              "col-span-12 flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white shadow-xl md:col-span-7",
              "ring-1 ring-white/10"
            )}
          >
            <h3 className="text-lg font-semibold tracking-tight">
              Export pour chaque plateforme
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Tailles et ratios optimisés par canal.
            </p>
            <div className="relative mt-6 min-h-[100px] overflow-hidden">
              <div className="flex flex-wrap gap-2 md:flex-nowrap md:gap-3">
                {PLATFORMS.map((p, i) => (
                  <motion.div
                    key={p.name}
                    className="flex shrink-0 flex-col rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-2 shadow-md backdrop-blur-sm"
                    initial={{ opacity: 0, x: 48 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{
                      delay: 0.08 + i * 0.1,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span className="text-xs font-semibold">{p.name}</span>
                    <span className="text-[10px] text-zinc-500">{p.tag}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

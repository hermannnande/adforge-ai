"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Affiche Facebook Ads",
  "Story Instagram",
  "Flyer restaurant",
  "Promo e-commerce",
] as const

const LINE1_WORDS = ["Transformez", "vos", "idées", "en"]
const LINE2_WORDS = ["publicités", "qui", "convertissent"]

const wordContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const wordItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const BLOBS = [
  {
    className:
      "left-[5%] top-[10%] h-[min(420px,55vw)] w-[min(420px,55vw)] bg-primary/35",
    duration: 22,
    x: [0, 45, -25, 0],
    y: [0, -35, 25, 0],
    scale: [1, 1.12, 0.92, 1],
  },
  {
    className:
      "right-[0%] top-[5%] h-[min(380px,50vw)] w-[min(380px,50vw)] bg-violet-500/30",
    duration: 18,
    x: [0, -40, 30, 0],
    y: [0, 40, -20, 0],
    scale: [1, 0.9, 1.08, 1],
  },
  {
    className:
      "bottom-[15%] left-[15%] h-[min(360px,48vw)] w-[min(360px,48vw)] bg-amber-500/25",
    duration: 25,
    x: [0, 35, -40, 0],
    y: [0, 30, -35, 0],
    scale: [1, 1.06, 0.94, 1],
  },
  {
    className:
      "bottom-[20%] right-[10%] h-[min(400px,52vw)] w-[min(400px,52vw)] bg-cyan-500/25",
    duration: 20,
    x: [0, -30, 40, 0],
    y: [0, -25, 35, 0],
    scale: [1, 0.95, 1.1, 1],
  },
]

const FLOATING_CARDS = [
  {
    label: "✨ Brief analysé",
    className:
      "left-0 top-0 -translate-x-[8%] -translate-y-[12%] md:-translate-x-[18%] md:-translate-y-[20%]",
    duration: 3,
    delay: 0,
  },
  {
    label: "🎨 3 visuels générés",
    className:
      "right-0 top-0 translate-x-[8%] -translate-y-[10%] md:translate-x-[16%] md:-translate-y-[18%]",
    duration: 4.5,
    delay: 0.2,
  },
  {
    label: "📊 2 crédits utilisés",
    className:
      "bottom-0 left-0 -translate-x-[6%] translate-y-[14%] md:-translate-x-[14%] md:translate-y-[22%]",
    duration: 5,
    delay: 0.4,
  },
  {
    label: "⬇️ Export HD prêt",
    className:
      "bottom-0 right-0 translate-x-[6%] translate-y-[12%] md:translate-x-[14%] md:translate-y-[20%]",
    duration: 3.5,
    delay: 0.1,
  },
]

export function Hero() {
  const [prompt, setPrompt] = useState("")
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const mockupParallaxY = useTransform(scrollYProgress, [0, 1], [0, 48])
  const mockupParallaxRotate = useTransform(scrollYProgress, [0, 1], [0, -1.5])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] overflow-hidden bg-background py-24 lg:py-32"
    >
      {/* —— Background layer —— */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        {BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full blur-3xl",
              blob.className
            )}
            animate={{
              x: blob.x,
              y: blob.y,
              scale: blob.scale,
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,_hsl(var(--foreground)/0.03)_1px,_transparent_1px)] bg-[length:24px_24px]"
        aria-hidden
      />

      <div className="relative z-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* —— Content layer —— */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Propulsé par l&apos;IA
          </motion.div>

          <motion.h1
            className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
            variants={wordContainer}
            initial="hidden"
            animate="visible"
          >
            {LINE1_WORDS.map((word) => (
              <motion.span key={`l1-${word}`} variants={wordItem} className="inline-block">
                {word}
              </motion.span>
            ))}
            <span className="h-0 w-full basis-full shrink-0 overflow-hidden" aria-hidden />
            {LINE2_WORDS.map((word) => (
              <motion.span
                key={`l2-${word}`}
                variants={wordItem}
                className="inline-block bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            AdForge AI transforme vos idées en visuels professionnels en secondes. Idéal pour les
            équipes marketing, PME et agences qui veulent scaler leur créa sans sacrifier la
            qualité.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              Commencer gratuitement
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/examples"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border/80 bg-background/60 px-7 text-sm font-medium transition-all backdrop-blur-md hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <Play className="size-4 fill-current" />
              Voir la démo
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-5 text-sm text-muted-foreground"
          >
            20 crédits offerts • Aucune carte requise
          </motion.p>
        </div>

        {/* —— Prompt bar —— */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.9, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-14 max-w-3xl"
        >
          <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-background/50 p-2 shadow-lg backdrop-blur-xl sm:flex-row sm:items-stretch">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez votre besoin publicitaire…"
              className="h-12 flex-1 border-0 bg-background/70 text-base shadow-none focus-visible:ring-0 md:h-12 md:text-base"
            />
            <button
              type="button"
              onClick={() => {
                const q = prompt.trim()
                router.push(q ? `/register?prompt=${encodeURIComponent(q)}` : '/register')
              }}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Sparkles className="size-4" />
              Générer
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.45 }}
            className="mt-3 flex flex-wrap justify-center gap-2"
          >
            {SUGGESTIONS.map((label, i) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => setPrompt(label)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.05, duration: 0.35 }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md",
                  "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                )}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* —— Floating mockup layer —— */}
        <div className="relative mx-auto mt-16 max-w-4xl md:mt-20 lg:mt-24">
          {FLOATING_CARDS.map((card) => (
            <motion.div
              key={card.label}
              aria-hidden
              className={cn(
                "pointer-events-none absolute z-10 hidden max-w-[200px] rounded-xl border border-border/60 bg-background/70 p-3 text-left text-xs font-medium text-foreground shadow-lg backdrop-blur-lg md:block",
                card.className
              )}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: card.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: card.delay,
              }}
            >
              {card.label}
            </motion.div>
          ))}

          <motion.div
            style={{ y: mockupParallaxY, rotateX: mockupParallaxRotate }}
            className="relative z-[1] perspective-[1200px]"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="mx-auto max-w-[min(100%,520px)] rounded-2xl border border-border/50 bg-background/60 p-3 shadow-2xl backdrop-blur-xl sm:max-w-2xl md:max-w-3xl md:p-4 lg:max-w-4xl"
            >
              {/* Fake toolbar */}
              <div className="mb-3 flex items-center gap-3 border-b border-border/40 pb-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex flex-1 gap-1 overflow-hidden text-[10px] font-medium text-muted-foreground sm:text-xs">
                  <span className="rounded-md bg-muted/60 px-2 py-1 text-foreground">
                    Studio
                  </span>
                  <span className="rounded-md px-2 py-1">Brief</span>
                  <span className="rounded-md px-2 py-1">Export</span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_min(42%,220px)] md:gap-4">
                {/* Chat panel */}
                <div className="flex min-h-[140px] flex-col gap-2 rounded-xl border border-border/40 bg-muted/20 p-3 md:min-h-[200px]">
                  <motion.div
                    className="max-w-[92%] rounded-lg rounded-tl-sm bg-primary/15 px-3 py-2 text-[11px] leading-snug text-foreground sm:text-xs"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                  >
                    Campagne été — ton joyeux, CTA &quot;Découvrir&quot;
                  </motion.div>
                  <motion.div
                    className="ml-auto max-w-[88%] rounded-lg rounded-tr-sm bg-violet-500/15 px-3 py-2 text-[11px] leading-snug sm:text-xs"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.35, duration: 0.4 }}
                  >
                    Génération des variantes en cours…
                  </motion.div>
                  <motion.div
                    className="max-w-[90%] rounded-lg rounded-tl-sm bg-cyan-500/10 px-3 py-2 text-[11px] leading-snug sm:text-xs"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                  >
                    ✓ Palette et typo alignées sur votre marque
                  </motion.div>
                </div>

                {/* Generated image */}
                <motion.div
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border/40 shadow-inner"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/40 via-violet-500/50 to-amber-400/35"
                    animate={{
                      scale: [1, 1.06, 1],
                      opacity: [0.85, 1, 0.85],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,hsl(var(--background)/0.15)_100%)]" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-[10px] font-medium text-white/90 drop-shadow-sm">
                    <span>Visuel #2</span>
                    <span className="rounded-md bg-black/25 px-2 py-0.5 backdrop-blur-sm">
                      1080×1350
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Fake actions */}
              <motion.div
                className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
              >
                {["Régénérer", "Variantes", "Exporter"].map((action) => (
                  <motion.span
                    key={action}
                    className="rounded-lg border border-border/50 bg-background/80 px-3 py-1.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm sm:text-xs"
                    whileHover={{ scale: 1.03, borderColor: "hsl(var(--primary) / 0.35)" }}
                  >
                    {action}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

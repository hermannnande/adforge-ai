"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"

import { cn } from "@/lib/utils"

const FLOATING = [
  {
    label: "📊 Dashboard",
    className:
      "left-[-4%] top-[8%] md:left-[-6%] md:top-[12%] bg-gradient-to-br from-primary/25 to-violet-500/20",
    delay: 0,
    yAmp: 10,
    duration: 5.5,
  },
  {
    label: "💬 Agent IA",
    className:
      "right-[-4%] top-[14%] md:right-[-5%] md:top-[18%] bg-gradient-to-br from-cyan-500/20 to-blue-600/15",
    delay: 0.6,
    yAmp: 12,
    duration: 6.2,
  },
  {
    label: "🎨 Studio",
    className:
      "bottom-[10%] left-[-2%] md:bottom-[14%] md:left-[-4%] bg-gradient-to-br from-amber-500/20 to-rose-500/15",
    delay: 1.1,
    yAmp: 9,
    duration: 5.8,
  },
] as const

export function VideoSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute left-[15%] top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-[10%] h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Voyez AdForge AI en action
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            2 minutes pour comprendre comment créer des publicités qui
            convertissent.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-5xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {FLOATING.map((card) => (
            <motion.div
              key={card.label}
              className={cn(
                "pointer-events-none absolute z-10 hidden sm:block",
                card.className
              )}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: card.delay,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="rounded-xl border border-border/60 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md md:px-4 md:py-2.5 md:text-sm"
                animate={{ y: [0, -card.yAmp, 0] }}
                transition={{
                  duration: card.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: card.delay + 0.55,
                }}
              >
                {card.label}
              </motion.div>
            </motion.div>
          ))}

          <div
            className={cn(
              "relative aspect-video overflow-hidden rounded-2xl border border-border/60 shadow-2xl",
              "bg-gradient-to-br from-background/80 via-background/40 to-background/80 p-[1px]",
              "ring-1 ring-white/10 dark:ring-white/5"
            )}
          >
            <div
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[0.95rem]",
                "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                aria-hidden
              >
                <div className="absolute -left-1/4 top-0 h-1/2 w-1/2 rounded-full bg-primary/25 blur-[100px]" />
                <div className="absolute -right-1/4 bottom-0 h-1/2 w-1/2 rounded-full bg-violet-500/20 blur-[100px]" />
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

              <motion.div
                className="relative z-[1] flex flex-col items-center gap-5"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.button
                  type="button"
                  className={cn(
                    "relative flex size-20 items-center justify-center rounded-full",
                    "border border-white/20 bg-white/10 backdrop-blur-lg",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.5)]",
                    "transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  )}
                  aria-label="Lire la démo vidéo"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border border-white/30"
                    animate={{
                      scale: [1, 1.35, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.span
                    className="absolute inset-[-6px] rounded-full border border-primary/40"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  />
                  <Play
                    className="relative ml-1 size-9 text-white drop-shadow-md"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </motion.button>
                <motion.p
                  className="text-sm font-medium text-zinc-300 md:text-base"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                >
                  Regarder la démo (2:14)
                </motion.p>
              </motion.div>

              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-90"
                style={{
                  boxShadow:
                    "inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 -1px 0 0 rgba(0,0,0,0.2)",
                }}
                aria-hidden
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

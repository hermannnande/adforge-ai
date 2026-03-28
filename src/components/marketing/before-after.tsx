"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const USER_MESSAGE =
  "Je veux une affiche pour mes sneakers premium, style urbain et moderne, pour Facebook Ads"

const AI_RESPONSE =
  "Parfait ! Je vous propose 3 angles créatifs pour votre campagne sneakers..."

const CHAR_DELAY = 0.028
const typingDuration = USER_MESSAGE.length * CHAR_DELAY
const aiRevealDelay = typingDuration + 0.35

const panelViewport = { once: true, margin: "-60px" } as const

export function BeforeAfter() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-25"
        aria-hidden
      >
        <div className="absolute -left-20 top-1/3 h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute -right-10 bottom-1/4 h-[320px] w-[420px] rounded-full bg-primary/15 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={panelViewport}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            D&apos;un simple texte à un visuel professionnel
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Voyez la magie opérer en temps réel.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[1fr_minmax(0,auto)_1fr] lg:items-center lg:gap-6">
          {/* Avant */}
          <motion.div
            className="order-1"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={panelViewport}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            <div
              className={cn(
                "rounded-3xl border border-white/20 bg-background/40 p-1 shadow-2xl backdrop-blur-xl",
                "dark:border-white/10 dark:bg-background/30"
              )}
            >
              <div className="rounded-[1.35rem] border border-border/50 bg-gradient-to-b from-muted/30 to-background/80 p-5 shadow-inner">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  MESSAGE
                </p>
                <div className="space-y-4 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm">
                  <div className="flex justify-end">
                    <div className="max-w-[95%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-left text-sm leading-relaxed text-primary-foreground shadow-md">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">
                        Vous
                      </span>
                      <p className="mt-1.5">
                        {USER_MESSAGE.split("").map((char, i) => (
                          <motion.span
                            key={i}
                            className="inline"
                            initial={{ opacity: 0, filter: "blur(4px)" }}
                            whileInView={{ opacity: 1, filter: "blur(0px)" }}
                            viewport={panelViewport}
                            transition={{
                              delay: i * CHAR_DELAY,
                              duration: 0.22,
                              ease: "easeOut",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </motion.span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={panelViewport}
                    transition={{
                      delay: aiRevealDelay,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-border/60 bg-muted/80 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        AdForge IA
                      </span>
                      <p className="mt-1.5 text-muted-foreground">{AI_RESPONSE}</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Centre — transformation (desktop) */}
          <motion.div
            className="order-3 flex flex-col items-center justify-center gap-2 lg:order-2 lg:px-2"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={panelViewport}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex size-24 items-center justify-center lg:size-28">
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/25"
                animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
              <motion.span
                className="absolute inset-2 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.25, 0.8] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                aria-hidden
              />
              <div className="relative flex size-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-violet-500/20 to-background px-2 py-2 shadow-xl backdrop-blur-md lg:size-[5.25rem]">
                <Sparkles className="size-5 shrink-0 text-primary lg:size-6" strokeWidth={1.5} />
                <span className="text-[11px] font-black tracking-tight text-foreground lg:text-xs">
                  IA
                </span>
              </div>
            </div>
            <div className="hidden items-center gap-1 text-muted-foreground lg:flex" aria-hidden>
              <ArrowRight className="size-5 opacity-60" />
            </div>
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground lg:hidden">
              Transformation IA
            </p>
          </motion.div>

          {/* Après */}
          <motion.div
            className="order-2 lg:order-3"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={panelViewport}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <div
              className={cn(
                "rounded-3xl border border-white/20 bg-background/40 p-1 shadow-2xl backdrop-blur-xl",
                "dark:border-white/10 dark:bg-background/30"
              )}
            >
              <div className="rounded-[1.35rem] border border-border/50 bg-gradient-to-b from-muted/20 to-background/90 p-5 shadow-inner">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  RÉSULTAT
                </p>
                <motion.div
                  className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={panelViewport}
                  transition={{
                    duration: 0.65,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(0,0,0,0.25),transparent_45%)]" />
                    <div className="relative flex h-full flex-col p-6 pt-10 md:p-8">
                      <motion.span
                        className="inline-flex w-fit rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={panelViewport}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        -30%
                      </motion.span>
                      <div className="mt-auto flex flex-1 flex-col justify-center">
                        <motion.h3
                          className="text-3xl font-black uppercase leading-none tracking-tight text-white drop-shadow-lg md:text-4xl"
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={panelViewport}
                          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                          SNEAKERS PRO
                        </motion.h3>
                        <motion.p
                          className="mt-3 text-sm font-medium text-white/85 md:text-base"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={panelViewport}
                          transition={{ delay: 0.5, duration: 0.45 }}
                        >
                          Collection 2026
                        </motion.p>
                        <motion.button
                          type="button"
                          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-violet-900 shadow-lg transition hover:bg-white/95"
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={panelViewport}
                          transition={{ delay: 0.58, duration: 0.45 }}
                        >
                          Découvrir
                          <ArrowRight className="size-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="mt-4 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={panelViewport}
                  transition={{ delay: 0.55, duration: 0.45 }}
                >
                  {[
                    { label: "Facebook Ads" },
                    { label: "1080×1080" },
                    { label: "2 crédits" },
                  ].map(({ label }) => (
                    <span
                      key={label}
                      className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
                    >
                      {label}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

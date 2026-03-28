"use client"

import { useRef, useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion"
import { Check, Download, MessageSquare, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

function FakeToolbar({ title }: { title: string }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border/60 bg-muted/30 px-3">
      <div className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-yellow-400" />
        <span className="size-2.5 rounded-full bg-green-400" />
      </div>
      <span className="flex-1 text-center text-[10px] font-medium tracking-wide text-muted-foreground">
        {title}
      </span>
      <div className="w-14" aria-hidden />
    </div>
  )
}

function ScreenShell({
  className,
  children,
  style,
}: {
  className?: string
  children: React.ReactNode
  style?: MotionStyle
}) {
  return (
    <motion.div
      className={cn(
        "absolute overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-2xl backdrop-blur-md",
        className
      )}
      style={style}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.35"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(2, Math.max(0, Math.floor(v * 3 + 0.15)))
    setActiveStep((prev) => (prev !== next ? next : prev))
  })

  const p1RotateY = useTransform(scrollYProgress, [0, 0.55, 1], [-8, -2, 0])
  const p1RotateX = useTransform(scrollYProgress, [0, 0.55, 1], [14, 6, 0])
  const p1X = useTransform(scrollYProgress, [0, 0.6, 1], [48, 12, -24])
  const p1Y = useTransform(scrollYProgress, [0, 0.5, 1], [56, 24, 8])
  const p1Scale = useTransform(scrollYProgress, [0, 1], [0.9, 0.96])

  const p2X = useTransform(scrollYProgress, [0, 0.45, 1], [36, 8, 0])
  const p2Y = useTransform(scrollYProgress, [0, 0.5, 1], [28, 10, 0])
  const p2RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [4, 1, 0])
  const p2Scale = useTransform(scrollYProgress, [0, 0.4, 1], [0.94, 0.98, 1])

  const p3Y = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [120, 40, 0, 0])
  const p3Scale = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [0.82, 0.92, 1, 1])
  const p3RotateX = useTransform(scrollYProgress, [0, 0.45, 1], [8, 2, 0])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-20 lg:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35 dark:opacity-20"
        aria-hidden
      >
        <div className="absolute left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[380px] w-[500px] rounded-full bg-violet-500/15 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Votre studio créatif, propulsé par l&apos;IA
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            De l&apos;idée au visuel publicitaire en quelques échanges avec votre agent IA.
          </p>
        </motion.div>

        <div
          className="relative mx-auto mt-16 min-h-[min(72vh,640px)] w-full max-w-5xl"
          style={{ perspective: "1200px" }}
        >
          <div
            className="relative h-[min(72vh,640px)] w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <ScreenShell
              className="left-[2%] top-[8%] z-[1] h-[58%] w-[78%] max-w-xl sm:left-[4%] sm:w-[72%]"
              style={{
                rotateX: p1RotateX,
                rotateY: p1RotateY,
                x: p1X,
                y: p1Y,
                scale: p1Scale,
              }}
            >
              <FakeToolbar title="Dashboard — Projets" />
              <div className="flex h-[calc(100%-2.5rem)] flex-col gap-3 p-4">
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-lg bg-gradient-to-br from-muted to-muted/40"
                    />
                  ))}
                </div>
                <div className="flex flex-1 gap-2">
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-sky-500/30 via-primary/25 to-violet-600/30" />
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-rose-500/25" />
                  <div className="hidden flex-1 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-600/30 sm:block" />
                </div>
              </div>
            </ScreenShell>

            <ScreenShell
              className="left-[10%] top-[18%] z-[2] h-[62%] w-[82%] max-w-xl sm:left-[14%] sm:w-[76%]"
              style={{
                rotateY: p2RotateY,
                x: p2X,
                y: p2Y,
                scale: p2Scale,
              }}
            >
              <FakeToolbar title="Studio — Génération" />
              <div className="grid h-[calc(100%-2.5rem)] grid-cols-1 gap-0 sm:grid-cols-5">
                <div className="flex flex-col justify-end gap-2 border-border/40 p-3 sm:col-span-2 sm:border-r">
                  <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-primary/90 px-3 py-2 text-[10px] leading-snug text-primary-foreground shadow-sm">
                    Affiche sneakers urbaine, ton premium…
                  </div>
                  <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-[10px] leading-snug text-foreground">
                    C&apos;est noté. Je prépare 3 directions créatives.
                  </div>
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[10px] leading-snug text-primary-foreground">
                    Ajoute un badge promo -30%.
                  </div>
                </div>
                <div className="relative min-h-[140px] sm:col-span-3">
                  <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 shadow-inner ring-1 ring-white/10">
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                      <p className="text-lg font-black tracking-tight text-white drop-shadow-md">
                        SNEAKERS PRO
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-white/80">
                        Collection 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScreenShell>

            <ScreenShell
              className="left-[18%] top-[28%] z-[3] h-[56%] w-[76%] max-w-md sm:left-[22%] sm:w-[68%]"
              style={{
                rotateX: p3RotateX,
                y: p3Y,
                scale: p3Scale,
              }}
            >
              <FakeToolbar title="Export — Livrables" />
              <div className="flex h-[calc(100%-2.5rem)] flex-col items-center justify-center gap-4 p-4">
                <div className="relative aspect-[4/5] w-[55%] max-w-[200px] overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-600/90 via-violet-700 to-indigo-900 shadow-lg ring-1 ring-white/15">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
                  <div className="relative flex h-full flex-col items-center justify-center p-3 text-center">
                    <span className="text-sm font-bold text-white">Export prêt</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["PNG", "JPG", "WebP"].map((fmt) => (
                    <span
                      key={fmt}
                      className="rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground"
                    >
                      {fmt}
                    </span>
                  ))}
                  <motion.span
                    className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    initial={false}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                  </motion.span>
                </div>
              </div>
            </ScreenShell>
          </div>
        </div>

        <motion.div
          className="relative mx-auto mt-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div
            className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block"
            aria-hidden
          />
          <div className="relative flex flex-col items-stretch gap-8 md:flex-row md:items-start md:justify-between md:gap-4">
            {(
              [
                { step: 0, label: "Décrivez", Icon: MessageSquare },
                { step: 1, label: "Générez", Icon: Sparkles },
                { step: 2, label: "Exportez", Icon: Download },
              ] as const
            ).map(({ step, label, Icon }, idx) => {
              const active = activeStep === step
              return (
                <div
                  key={label}
                  className="relative z-[1] flex flex-1 flex-col items-center text-center"
                >
                  <motion.div
                    className={cn(
                      "relative flex size-14 items-center justify-center rounded-2xl border-2 shadow-lg transition-colors",
                      active
                        ? "border-primary bg-primary/15 text-primary shadow-primary/20"
                        : "border-border/80 bg-background/90 text-muted-foreground"
                    )}
                    animate={{
                      scale: active ? 1.06 : 1,
                      boxShadow: active
                        ? "0 0 0 8px color-mix(in oklch, var(--primary) 18%, transparent)"
                        : "0 0 0 0px transparent",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  >
                    <Icon className="size-6" strokeWidth={1.75} />
                    {active ? (
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/40" />
                    ) : null}
                  </motion.div>
                  <span
                    className={cn(
                      "mt-3 text-xs font-semibold uppercase tracking-widest",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  <span className="mt-1 text-[10px] text-muted-foreground/80">
                    Étape {idx + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

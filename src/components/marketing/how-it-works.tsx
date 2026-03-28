"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Download, MessageSquare, Sparkles } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const bubbleVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.35 + i * 0.18,
      duration: 0.45,
      ease: smoothEase,
    },
  }),
};

const squareVariants = {
  hidden: { opacity: 0, scale: 0.85, rotate: -4 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.35 + i * 0.22,
      duration: 0.5,
      ease: smoothEase,
    },
  }),
};

const formatFan = [
  { label: "Facebook", className: "from-blue-600/90 to-blue-500/70", r: -8 },
  { label: "Instagram", className: "from-fuchsia-600/90 to-orange-500/70", r: 0 },
  { label: "TikTok", className: "from-zinc-800 to-zinc-950", r: 8 },
] as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.15"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-32"
    >
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className={cn(
              "font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
              "bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
            )}
          >
            Comment ça marche
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            De l&apos;idée au visuel en 3 étapes simples
          </p>
        </motion.div>

        <div className="relative mt-16 md:mt-20">
          <div
            className="absolute bottom-0 left-[1.1875rem] top-0 w-0.5 rounded-full bg-primary/30 md:left-[1.4375rem]"
            aria-hidden
          >
            <motion.div
              className="h-full w-full origin-top rounded-full bg-primary"
              style={{ scaleY: lineScale }}
            />
          </div>

          <ol className="relative flex flex-col gap-12 md:gap-16">
            <motion.li
              className="relative pl-10 md:pl-14"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.55,
                delay: 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span
                className="absolute left-0 top-10 z-10 flex size-12 -translate-x-[calc(50%-2px)] items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md shadow-primary/25 md:top-12"
                aria-hidden
              >
                01
              </span>
              <div
                className={cn(
                  "grid gap-8 rounded-2xl border border-border/50 bg-background/50 p-8",
                  "shadow-sm backdrop-blur-md md:grid-cols-[1fr_minmax(0,14rem)] md:items-center"
                )}
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Décrivez votre besoin
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    Écrivez un simple message décrivant votre produit, votre
                    offre et votre cible. Notre interface guide vos intentions
                    pour un brief clair en quelques secondes.
                  </p>
                </div>
                <motion.div
                  className="flex min-h-[140px] flex-col gap-2 rounded-xl border border-border/40 bg-muted/20 p-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                >
                  {[
                    "Promo été — boissons fraîches, 18–35 ans",
                    "Angle lifestyle, tons pastel",
                    "3 formats : story, carré, bannière",
                  ].map((text, i) => (
                    <motion.div
                      key={text}
                      custom={i}
                      variants={bubbleVariants}
                      className={cn(
                        "max-w-[95%] rounded-2xl px-3 py-2 text-xs leading-snug shadow-sm",
                        i === 1
                          ? "self-end bg-primary text-primary-foreground"
                          : "self-start bg-background/80 text-foreground ring-1 ring-border/50"
                      )}
                    >
                      {text}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.li>

            <motion.li
              className="relative pl-10 md:pl-14"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.55,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span
                className="absolute left-0 top-10 z-10 flex size-12 -translate-x-[calc(50%-2px)] items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md shadow-primary/25 md:top-12"
                aria-hidden
              >
                02
              </span>
              <div
                className={cn(
                  "grid gap-8 rounded-2xl border border-border/50 bg-background/50 p-8",
                  "shadow-sm backdrop-blur-md md:grid-cols-[1fr_minmax(0,14rem)] md:items-center"
                )}
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    L&apos;IA crée pour vous
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    Notre agent analyse votre brief, propose des angles créatifs
                    et génère plusieurs visuels prêts à affiner ou exporter.
                  </p>
                </div>
                <motion.div
                  className="grid grid-cols-3 gap-2"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                >
                  {[
                    "from-violet-500/80 to-fuchsia-500/70",
                    "from-cyan-500/75 to-blue-600/70",
                    "from-amber-400/80 to-orange-500/75",
                  ].map((grad, i) => (
                    <motion.div
                      key={grad}
                      custom={i}
                      variants={squareVariants}
                      className={cn(
                        "aspect-square rounded-xl bg-gradient-to-br shadow-inner ring-1 ring-white/10",
                        grad
                      )}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.li>

            <motion.li
              className="relative pl-10 md:pl-14"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.55,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span
                className="absolute left-0 top-10 z-10 flex size-12 -translate-x-[calc(50%-2px)] items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md shadow-primary/25 md:top-12"
                aria-hidden
              >
                03
              </span>
              <div
                className={cn(
                  "grid gap-8 rounded-2xl border border-border/50 bg-background/50 p-8",
                  "shadow-sm backdrop-blur-md md:grid-cols-[1fr_minmax(0,15rem)] md:items-center"
                )}
              >
                <div>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Download className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Exportez et publiez
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    Choisissez votre favori, ajustez si besoin, et exportez dans
                    le format de votre plateforme en un clic.
                  </p>
                </div>
                <div className="relative flex min-h-[160px] items-center justify-center">
                  {formatFan.map((f, i) => (
                    <motion.div
                      key={f.label}
                      className={cn(
                        "absolute flex h-24 w-20 flex-col justify-end rounded-xl bg-gradient-to-br p-3 text-[10px] font-semibold text-white shadow-lg ring-1 ring-white/20",
                        f.className
                      )}
                      initial={{ opacity: 0, y: 16, rotate: 0, scale: 0.9 }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        rotate: f.r,
                        scale: 1,
                      }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        delay: 0.4 + i * 0.15,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        zIndex: 3 - i,
                        x: (i - 1) * 28,
                      }}
                    >
                      <span className="opacity-90">{f.label}</span>
                      <span className="mt-2 block h-8 rounded-md bg-white/15" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.li>
          </ol>
        </div>
      </div>
    </section>
  );
}

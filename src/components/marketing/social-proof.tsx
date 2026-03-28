"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, count, target]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = `${v.toLocaleString("fr-FR")}${suffix}`;
      }
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

function AnimatedRating({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, count, target]);

  useEffect(() => {
    const unsubscribe = count.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = v.toLocaleString("fr-FR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
      }
    });
    return unsubscribe;
  }, [count]);

  return (
    <span ref={ref} className="tabular-nums">
      0,0
    </span>
  );
}

const LOGO_NAMES = [
  "TechCorp",
  "ModaStudio",
  "FoodExpress",
  "BeautyLab",
  "SportZone",
  "ImmoPlus",
  "AgenceXY",
  "StartupCI",
] as const;

const cardEnter = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
} as const;

export function SocialProof() {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 lg:py-24",
        "bg-gradient-to-b from-muted/50 via-background to-muted/50"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_hsl(var(--foreground)/0.06)_1px,_transparent_1px)] bg-[length:20px_20px] opacity-70"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          <motion.article
            className={cn(
              "rounded-2xl border border-border/40 bg-background/60 p-6 text-center",
              "shadow-sm backdrop-blur-lg"
            )}
            {...cardEnter}
            transition={{ ...cardEnter.transition, delay: 0 }}
          >
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <AnimatedCounter target={2500} suffix="+" />
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              créations générées
            </p>
            <p className="mt-1 text-xs text-muted-foreground">et ça continue</p>
          </motion.article>

          <motion.article
            className={cn(
              "rounded-2xl border border-border/40 bg-background/60 p-6 text-center",
              "shadow-sm backdrop-blur-lg"
            )}
            {...cardEnter}
            transition={{ ...cardEnter.transition, delay: 0.08 }}
          >
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <AnimatedCounter target={500} suffix="+" />
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              créateurs actifs
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PME &amp; agences</p>
          </motion.article>

          <motion.article
            className={cn(
              "rounded-2xl border border-border/40 bg-background/60 p-6 text-center",
              "shadow-sm backdrop-blur-lg"
            )}
            {...cardEnter}
            transition={{ ...cardEnter.transition, delay: 0.16 }}
          >
            <p className="flex items-center justify-center gap-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <AnimatedRating target={4.8} />
              <span className="text-lg font-semibold text-muted-foreground sm:text-xl">
                /5
              </span>
            </p>
            <div
              className="mt-3 flex justify-center gap-0.5"
              aria-hidden
            >
              {[0, 1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className="size-5 fill-amber-400 text-amber-400 sm:size-6"
                  strokeWidth={0}
                />
              ))}
              <span className="relative inline-flex size-5 sm:size-6">
                <Star
                  className="absolute size-5 text-amber-400/30 sm:size-6"
                  strokeWidth={1.5}
                />
                <span className="absolute inset-0 w-[80%] overflow-hidden">
                  <Star
                    className="size-5 fill-amber-400 text-amber-400 sm:size-6"
                    strokeWidth={0}
                  />
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              satisfaction client
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              sur 200+ avis
            </p>
          </motion.article>

          <motion.article
            className={cn(
              "rounded-2xl border border-border/40 bg-background/60 p-6 text-center",
              "shadow-sm backdrop-blur-lg"
            )}
            {...cardEnter}
            transition={{ ...cardEnter.transition, delay: 0.24 }}
          >
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              &lt; 10s
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              temps de génération
            </p>
            <p className="mt-1 text-xs text-muted-foreground">draft en 3s</p>
          </motion.article>
        </div>

        <div
          className="relative mt-14 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <motion.div
            className="flex w-max gap-16 opacity-45"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 42,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[0, 1].map((dup) => (
              <div
                key={dup}
                className="flex shrink-0 items-center gap-10 pr-10 text-sm font-medium tracking-wide text-muted-foreground/80"
              >
                {LOGO_NAMES.map((name, i) => (
                  <span key={`${dup}-${name}`} className="whitespace-nowrap">
                    {name}
                    {i < LOGO_NAMES.length - 1 ? (
                      <span className="ml-10 text-muted-foreground/35">•</span>
                    ) : null}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

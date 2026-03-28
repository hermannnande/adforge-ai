"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const MESH_BLOBS = [
  {
    className:
      "left-[-8%] top-[10%] h-[min(380px,70vw)] w-[min(380px,70vw)] bg-violet-600/25",
    duration: 20,
    x: [0, 36, -22, 0] as [number, number, number, number],
    y: [0, -28, 20, 0] as [number, number, number, number],
    scale: [1, 1.08, 0.94, 1] as [number, number, number, number],
  },
  {
    className:
      "right-[-5%] top-[20%] h-[min(320px,60vw)] w-[min(320px,60vw)] bg-cyan-500/20",
    duration: 18,
    x: [0, -32, 24, 0] as [number, number, number, number],
    y: [0, 32, -18, 0] as [number, number, number, number],
    scale: [1, 0.92, 1.06, 1] as [number, number, number, number],
  },
  {
    className:
      "bottom-[5%] left-[20%] h-[min(300px,55vw)] w-[min(300px,55vw)] bg-primary/20",
    duration: 24,
    x: [0, 28, -34, 0] as [number, number, number, number],
    y: [0, 24, -30, 0] as [number, number, number, number],
    scale: [1, 1.04, 0.96, 1] as [number, number, number, number],
  },
];

const easeInOut = "easeInOut" as const;

const floatLeft = {
  y: [0, -14, 6, 0],
  rotate: [-6, -4, -7, -6],
  transition: { duration: 7, repeat: Infinity, ease: easeInOut },
};

const floatRight = {
  y: [0, 12, -10, 0],
  rotate: [7, 5, 8, 7],
  transition: { duration: 8.5, repeat: Infinity, ease: easeInOut },
};

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 text-white lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {MESH_BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full blur-3xl", blob.className)}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 lg:block xl:left-4"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.div
            className="h-44 w-32 -rotate-6 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-1 shadow-2xl shadow-black/40 ring-1 ring-white/10"
            animate={floatLeft}
          >
            <div className="flex h-full w-full flex-col rounded-[0.875rem] bg-zinc-900/40 p-2 backdrop-blur-sm">
              <div className="h-2 w-8 rounded-full bg-white/20" />
              <div className="mt-3 flex-1 rounded-lg bg-gradient-to-br from-white/15 to-transparent" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block xl:right-4"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.div
            className="h-40 w-28 rotate-6 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 p-1 shadow-2xl shadow-black/40 ring-1 ring-white/10"
            animate={floatRight}
          >
            <div className="flex h-full w-full flex-col rounded-[0.875rem] bg-zinc-900/40 p-2 backdrop-blur-sm">
              <div className="h-2 w-10 rounded-full bg-white/20" />
              <div className="mt-3 flex-1 rounded-lg bg-gradient-to-br from-white/15 to-transparent" />
            </div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className={cn(
                "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5",
                "text-xs font-medium tracking-wide text-zinc-300"
              )}
            >
              <span className="relative mr-2 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Prêt à commencer ?
            </span>
          </motion.div>

          <motion.h2
            className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Créez votre première publicité en 30 secondes
          </motion.h2>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-base text-zinc-400 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.55,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Rejoignez des créateurs et des marques qui génèrent des visuels
            publicitaires pros sans équipe design.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.55,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href="/register"
              className={cn(
                "inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-md border-0 bg-white px-6 text-sm font-medium text-zinc-950 transition-colors",
                "hover:bg-zinc-100"
              )}
            >
              Commencer gratuitement
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "inline-flex h-11 min-w-[200px] items-center justify-center rounded-md border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition-colors",
                "hover:bg-white/10 hover:text-white"
              )}
            >
              Voir les tarifs
            </Link>
          </motion.div>

          <motion.p
            className="mt-10 text-xs text-zinc-500 sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            20 crédits offerts • Aucune carte requise • Annulez à tout moment
          </motion.p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FolderOpen,
  Layers,
  Palette,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Brain,
    title: "Agent IA conversationnel",
    description:
      "Guidé par une IA qui comprend le marketing. Décrivez, l'agent propose.",
  },
  {
    icon: Layers,
    title: "Multi-format automatique",
    description:
      "Déclinez un visuel en 1:1, 4:5, 9:16, 16:9 en un clic.",
  },
  {
    icon: Palette,
    title: "Brand Kit intégré",
    description:
      "Gardez vos couleurs, polices et ton de marque cohérents sur tous vos visuels.",
  },
  {
    icon: FolderOpen,
    title: "Bibliothèque persistante",
    description:
      "Retrouvez tous vos projets, reprenez exactement où vous en étiez.",
  },
  {
    icon: Zap,
    title: "Draft rapide, rendu premium",
    description:
      "Testez vos idées à moindre coût, puis passez en qualité maximale.",
  },
  {
    icon: Shield,
    title: "Crédits transparents",
    description:
      "Pas de surprise. Vous savez exactement combien coûte chaque action.",
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesGrid() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            AdForge AI combine intelligence artificielle et expertise marketing
            pour créer des visuels qui convertissent.
          </p>
        </div>

        <motion.ul
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.li key={feature.title} variants={item}>
                <div
                  className={cn(
                    "h-full rounded-xl border border-border p-6",
                    "bg-card/40 transition-colors hover:bg-card/60"
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}

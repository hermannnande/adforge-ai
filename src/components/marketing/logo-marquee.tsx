"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const ROW1 = [
  "Facebook Ads",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "LinkedIn",
  "X / Twitter",
  "Pinterest",
  "Google Ads",
] as const

const ROW2 = [
  "Agent IA",
  "Multi-format",
  "Brand Kit",
  "Export HD",
  "Prompt Memory",
  "Templates",
  "Analytics",
  "Mobile Money",
] as const

function Pill({ children }: { children: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border border-border/50 bg-background/50 px-5 py-2.5 text-sm font-medium backdrop-blur-sm",
        "shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
      )}
    >
      {children}
    </span>
  )
}

function MarqueeRow({
  items,
  direction,
  durationSec,
}: {
  items: readonly string[]
  direction: "ltr" | "rtl"
  durationSec: number
}) {
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden py-1">
      <motion.div
        className="flex w-max gap-4"
        aria-hidden
        animate={
          direction === "ltr"
            ? { x: ["0%", "-50%"] }
            : { x: ["-50%", "0%"] }
        }
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: durationSec,
            ease: "linear",
          },
        }}
      >
        {doubled.map((label, i) => (
          <Pill key={`${label}-${i}`}>{label}</Pill>
        ))}
      </motion.div>
    </div>
  )
}

export function LogoMarquee() {
  return (
    <section
      className="relative w-full overflow-hidden py-12"
      aria-label="Plateformes et fonctionnalités"
    >
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="flex flex-col gap-4">
          <MarqueeRow items={ROW1} direction="ltr" durationSec={30} />
          <MarqueeRow items={ROW2} direction="rtl" durationSec={35} />
        </div>
      </motion.div>
    </section>
  )
}

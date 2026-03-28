"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const FILTERS = [
  "Tous",
  "E-commerce",
  "Restauration",
  "Beauté",
  "Immobilier",
  "Mode",
] as const

type FilterId = (typeof FILTERS)[number]

type GalleryItem = {
  id: string
  title: string
  category: string
  gradientClass: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    title: "Sneakers Pro Max",
    category: "E-commerce",
    gradientClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
  },
  {
    id: "2",
    title: "Pizza Napoli",
    category: "Restauration",
    gradientClass: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    id: "3",
    title: "Sérum Éclat",
    category: "Beauté",
    gradientClass: "bg-gradient-to-br from-pink-500 to-rose-500",
  },
  {
    id: "4",
    title: "Villa Prestige",
    category: "Immobilier",
    gradientClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
  {
    id: "5",
    title: "Collection Été",
    category: "Mode",
    gradientClass: "bg-gradient-to-br from-amber-500 to-yellow-500",
  },
  {
    id: "6",
    title: "Coaching Fitness",
    category: "Santé",
    gradientClass: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
]

const ease = [0.22, 1, 0.36, 1] as const

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const blockVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("Tous")

  const visibleItems = useMemo(() => {
    if (activeFilter === "Tous") return GALLERY_ITEMS
    return GALLERY_ITEMS.filter((item) => item.category === activeFilter)
  }, [activeFilter])

  return (
    <section className="py-20 lg:py-28">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionVariants}
      >
        <motion.div className="text-center" variants={blockVariants}>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Des créations pour chaque besoin
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Facebook Ads, Instagram, TikTok, flyers et plus encore.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          variants={blockVariants}
        >
          {FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveFilter(label)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeFilter === label
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <motion.ul
          className="mt-12 grid grid-cols-1 list-none gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={listVariants}
        >
          {visibleItems.map((item) => (
            <motion.li key={item.id} variants={cardVariants} className="list-none">
              <div
                className={cn(
                  "group relative aspect-[4/5] overflow-hidden rounded-xl transition-transform duration-300 hover:scale-[1.02]",
                  item.gradientClass
                )}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                  <p className="mt-2 text-lg font-semibold text-white drop-shadow-sm">
                    {item.title}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  )
}

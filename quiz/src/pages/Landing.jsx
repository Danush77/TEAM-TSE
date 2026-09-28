import { motion } from 'framer-motion'
import { useMemo } from 'react'
import ModuleCard from '../components/ModuleCard'
import { TRACKS } from '../data/modules'
import { getAllProgress } from '../lib/progress'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export default function Landing() {
  const progress = useMemo(() => getAllProgress(), [])

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center sm:mb-14"
      >
        <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
          16 modules · in-depth &amp; tricky
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl">
          Test what you actually know.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
          Pick a module below. Mixed multiple-choice, multi-select, and typed-answer
          questions — no easy fluff, real gotchas.
        </p>
      </motion.header>

      {TRACKS.map((track, index) => (
        <section key={track.id} className="mb-12 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="mb-4 font-display text-lg font-semibold text-white/80"
          >
            {track.label}
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {track.modules.map((module) => (
              <ModuleCard key={module.id} mod={module} progress={progress[module.id]} />
            ))}
          </motion.div>
        </section>
      ))}
    </main>
  )
}

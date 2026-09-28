import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getModule } from '../data/modules'
import Icon from '../components/Icon'
import Confetti from '../components/Confetti'

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start
    let raf
    function step(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function Results() {
  const { moduleId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const mod = state?.mod || getModule(moduleId)

  if (!state) {
    navigate(`/quiz/${moduleId}`, { replace: true })
    return null
  }

  const { score, total, answers } = state
  const pct = Math.round((score / total) * 100)
  const animatedScore = useCountUp(score)
  const isGreat = pct >= 80
  const isGood = pct >= 50

  const verdict = isGreat ? 'Excellent work' : isGood ? 'Solid effort' : 'Room to grow'
  const verdictColor = isGreat ? '#33c9a3' : isGood ? '#f5a623' : '#ff5c5c'

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {isGreat && <Confetti />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center"
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: `${mod.color}1f`, color: mod.color }}
        >
          <Icon name="trophy" size={30} />
        </div>
        <p className="text-sm font-medium" style={{ color: verdictColor }}>
          {verdict}
        </p>
        <h1 className="mt-1 font-display text-5xl font-bold text-white">
          {animatedScore}<span className="text-white/30">/{total}</span>
        </h1>
        <p className="mt-2 text-white/50">{mod.title} · {pct}% correct</p>
      </motion.div>

      <div className="mt-10 flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/quiz/${moduleId}`)}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          <Icon name="refresh" size={15} /> Retry
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80"
        >
          All modules
        </motion.button>
      </div>

      <div className="mt-12 space-y-3">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">Review</h2>
        {answers.map((a, i) => (
          <motion.div
            key={a.question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`rounded-xl border p-4 ${
              a.correct ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-rose-400/20 bg-rose-400/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                name={a.correct ? 'check' : 'x'}
                size={16}
                className={`mt-0.5 shrink-0 ${a.correct ? 'text-emerald-400' : 'text-rose-400'}`}
              />
              <div className="text-sm text-white/70">{a.question.prompt}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

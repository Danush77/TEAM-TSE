import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import ProgressRing from './ProgressRing'

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function ModuleCard({ mod, progress }) {
  const navigate = useNavigate()
  const checkpoint = progress?.inProgress
  const hasCheckpoint = Boolean(checkpoint?.questions?.length)
  const hasProgress = (progress?.attempts ?? 0) > 0 || hasCheckpoint
  const total = progress?.total ?? 0
  const best = progress?.best ?? 0
  const checkpointTotal = checkpoint?.questions?.length ?? mod.questionCount
  const answeredCount = hasCheckpoint ? Math.min(checkpoint.answers?.length ?? 0, checkpointTotal) : 0
  const resumeQuestion = hasCheckpoint ? Math.min((checkpoint.index ?? 0) + 1, checkpointTotal) : 0
  const percent = hasCheckpoint
    ? Math.round((answeredCount / checkpointTotal) * 100)
    : total ? Math.round((best / total) * 100) : 0

  return (
    <motion.button
      variants={item}
      whileHover={{ y: -4, borderColor: `${mod.color}70`, boxShadow: `0 0 22px ${mod.color}24` }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/quiz/${mod.id}`)}
      aria-label={hasCheckpoint ? `Resume ${mod.title} at question ${resumeQuestion} of ${checkpointTotal}` : `Start ${mod.title}`}
      className="group relative h-full min-h-[164px] w-full box-border overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.035] p-4 text-left transition-colors hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:p-5"
    >
      <div className="relative z-10">
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: `${mod.color}1f`, color: mod.color }}
          aria-hidden="true"
        >
          <Icon name={mod.icon} size={21} />
        </span>
        {hasProgress && (
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center" aria-label={hasCheckpoint ? `Progress ${answeredCount} of ${checkpointTotal}` : `Best score ${percent}%`}>
            <ProgressRing percent={percent} color={mod.color} size={36} stroke={3} />
            <span className="absolute text-[9px] font-semibold tabular-nums text-white/75">{percent}%</span>
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-display text-sm font-semibold text-white/90">{mod.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-white/50">{mod.tagline}</p>

      <p className="mt-3.5 text-xs text-white/40">
        {hasCheckpoint
          ? `In progress: ${answeredCount}/${checkpointTotal}`
          : hasProgress && total ? `Best: ${best}/${total}` : 'Not started'}
      </p>
      </div>
    </motion.button>
  )
}

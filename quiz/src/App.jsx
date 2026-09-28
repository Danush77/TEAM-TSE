import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import AmbientEffects from './components/AmbientEffects'

export default function App() {
  const location = useLocation()
  const moduleId = location.pathname.startsWith('/quiz/') ? location.pathname.split('/')[2] : null

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(600px circle at 20% -10%, rgba(79,124,255,0.25), transparent 60%), radial-gradient(500px circle at 90% 20%, rgba(160,108,247,0.18), transparent 60%)',
        }}
      />
      <AmbientEffects moduleId={moduleId} />
      <AnimatePresence mode="wait">
        <div className="relative z-10">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/quiz/:moduleId" element={<Quiz />} />
            <Route path="/results/:moduleId" element={<Results />} />
          </Routes>
        </div>
      </AnimatePresence>
    </div>
  )
}

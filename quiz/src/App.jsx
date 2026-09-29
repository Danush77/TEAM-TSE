import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import StudyGuide from './pages/StudyGuide'
import LessonPage from './pages/LessonPage'
import MiniChallengePage from './pages/MiniChallengePage'
import PracticeExams from './pages/PracticeExams'
import AmbientEffects from './components/AmbientEffects'
import { ThemeProvider, ThemeToggle } from './components/ThemeContext'

const HtmlJavaScriptPracticeExams = lazy(() => import('./pages/HtmlJavaScriptPracticeExams'))

export default function App() {
  const { pathname } = useLocation()
  const quizMatch = pathname.match(/^\/quiz\/([^/]+)\/?$/)
  const showAmbientEffects = pathname === '/' || Boolean(quizMatch)

  return (
    <ThemeProvider>
      <div className="relative isolate min-h-screen bg-[var(--page-bg)] text-[var(--page-fg)]">
        {showAmbientEffects && <AmbientEffects moduleId={quizMatch?.[1]} />}
        <div className="relative z-10 flex w-full justify-end px-4 py-2 sm:px-6 lg:px-10">
          <ThemeToggle />
        </div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/quiz/:moduleId" element={<Quiz />} />
            <Route path="/results/:moduleId" element={<Results />} />
            <Route path="/course/:moduleId" element={<StudyGuide />} />
            <Route path="/course/:moduleId/topic/:topicId" element={<LessonPage />} />
            <Route path="/course/:moduleId/activity/:activityId" element={<MiniChallengePage />} />
            <Route path="/study/:moduleId" element={<StudyGuide />} />
            <Route path="/study/html-css-javascript/exams" element={<Suspense fallback={<p className="px-6 py-12 text-center text-sm text-white/60">Loading practice exams...</p>}><HtmlJavaScriptPracticeExams /></Suspense>} />
            <Route path="/study/html-css-javascript/exams/:examId" element={<Suspense fallback={<p className="px-6 py-12 text-center text-sm text-white/60">Loading practice exam...</p>}><HtmlJavaScriptPracticeExams /></Suspense>} />
            <Route path="/study/mysql/exams" element={<PracticeExams />} />
            <Route path="/study/mysql/exams/:examId" element={<PracticeExams />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

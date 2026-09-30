export function getSqlVisualLabHref() {
  if (import.meta.env.DEV) return '/sql-visual-lab/'

  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  const quizSegment = pathSegments.lastIndexOf('quiz')
  if (quizSegment >= 0) {
    const appRoot = `/${pathSegments.slice(0, quizSegment + 1).join('/')}`
    return `${appRoot}/sql-visual-lab/`
  }

  return new URL('../sql-visual-lab/', import.meta.url).pathname
}

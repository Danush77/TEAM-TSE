import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // The course app is published under /TEAM-TSE/courses/ on GitHub Pages.
  // Relative asset URLs also keep the build working under that repo subpath.
  base: './',
  plugins: [react(), tailwindcss()],
})

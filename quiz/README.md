# SkillCheck — Interactive Dev Quiz Platform

React + Framer Motion quiz app covering 16 modules (Foundation + Advanced tracks).
No backend — progress is stored in the browser via localStorage.

## Run locally
```
npm install
npm run dev
```

## Build for production
```
npm run build
```
Outputs a static `dist/` folder — deployable to GitHub Pages, Netlify, Vercel, etc.

## Adding/editing questions
Each module's questions live in `src/data/quizzes/<module-id>.js` as a plain array.
Supported question types: `mcq`, `multi` (select all that apply), `text` (typed answer),
`tf` (true/false), `code-output` (predict-the-output, rendered as mcq).

Difficulty labels use one shared three-level scale across every module:
`Beginner`, `Medium`, and `Hard`. Legacy `medium`, `hard`, `tricky`, and
`expert` values are normalized automatically and displayed in Beginner-to-Hard order.

Currently only **MySQL** (`src/data/quizzes/mysql.js`) is fully drafted with 14 in-depth,
tricky questions — treat it as the reference for depth/tone. The other 15 modules have a
single placeholder question each (marked `// TODO`) so the app is fully playable end-to-end;
they need to be expanded to ~10-15 questions the same way.

Module metadata (title, icon, color, tagline) lives in `src/data/modules.js`.

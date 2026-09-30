# TSE Learning Hub — Courses and Practice

React + Framer Motion course library covering 16 Foundation and Advanced modules.
Course material is the primary experience; each module's quiz is a secondary self-check.
No backend — lesson progress and quiz answers are stored in the browser via localStorage.

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

## Course material
The home route is the course library. Shared course pages use `/course/:moduleId`; the previous `/study/:moduleId` path remains as an alias. Course data is registered in `src/data/course-catalog.js`, with lesson units stored by module. The reader keeps lesson content and examples in-page and saves completion locally.

The standalone SQL Visual Learning Lab lives in `public/sql-visual-lab/` and is served at `/sql-visual-lab/` during development and `/courses/sql-visual-lab/` after deployment. It runs a small read-only sample database in the browser and visualizes common MySQL-style SELECT stages. See its [README](public/sql-visual-lab/README.md) for local serving instructions, challenges, and SQL dialect limitations.

MySQL is the first populated course with 33 syllabus units, dedicated lesson routes, and four cumulative practice exams. Each topic exports its content from `src/data/courses/mysql/topics/<topic-id>.js`; the shared lesson page displays the standard sections for every module. Mini challenges live in the course's `activities/` folder and open as individual pages. The supplied lesson export is embedded in JavaScript modules, not loaded from a `.txt` file at runtime.

To add another course, create its topic modules under `src/data/courses/<module-id>/topics/`, register lazy imports in that course's `index.js` and `src/data/courses/loaders.js`, and add its syllabus and status metadata to `src/data/course-catalog.js`. Use the section keys `whatIsIt`, `syntaxBreakdown`, `basicExample`, `goingDeeper`, `commonMistakes`, `edgeCaseSpotlight`, `tryThis`, `answerKey`, `quickRecap`, and `upNext`. Other modules keep the same reader shell and remain marked as pending until their lesson content is supplied. Practice quizzes remain at `/quiz/:moduleId`; practice exam answers do not run or get sent to a server.

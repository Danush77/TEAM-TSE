# SQL Visual Learning Lab

A standalone, static SQL practice page for the TSE Learning Hub. The editor,
database, query results, challenge checks, and visual query stages run in the
visitor's browser. No account or backend is used.

## Run locally

Use a local static server so the browser can fetch `schema.sql` and
`challenges.json` as files. From this directory, run:

```bash
python -m http.server 8001
```

Then open <http://localhost:8001/>. The lab also appears at
`/sql-visual-lab/` while the course app's Vite development server is running.
The GitHub Pages deployment copies this folder from Vite's `public/` directory
to `/courses/sql-visual-lab/`.

The SQL.js and node-sql-parser files are pinned local copies in `vendor/`;
`worker.js` tries those first and has version-pinned CDN fallbacks. The SQL
engine and parser run inside a dedicated Web Worker. CodeMirror 5 still loads
from its pinned CDN and falls back to a plain textarea if unavailable. The
worker can run queries offline after the page assets have loaded. If startup
fails, the lab shows a Retry engine button. SQL data stays in memory and is
never uploaded. The vendor folder includes the libraries' license texts.

## How the visual stage builder works

`engine.js` asks node-sql-parser to parse the user's one-statement SELECT query
into a MySQL-flavored AST. It builds partial SELECT statements from that AST,
adding clauses in logical order. `app.js` sends the final query and each
partial query to `worker.js`, which verifies each request again, prepares only
SELECT ASTs, and executes them against the in-memory sql.js database. The
database is switched to SQLite `query_only` mode after its schema and sample
rows load. The worker returns at most 5,000 rows per request and is terminated
and recreated if a request exceeds the configurable 5-second timeout or the
learner cancels it. Results shown in the page remain limited to 100 rows.

SQL.js does not expose SQLite's authorizer callback. The lab uses a conservative
parser allow-list, a semicolon-aware single-statement check, SQLite's
`query_only` mode, a fixed local schema, and a worker that can be terminated to
provide layered browser-side protection. This is appropriate for this fixed,
local teaching database; it is not a replacement for server-side controls when
connecting to a real database.

The resulting tables and row counts are compared to show filtering, joins,
grouping, projection, sorting, and limits. The group cards are built from
group-key values returned by SQL.js. If the parser cannot parse a query or the
query uses an unsupported structure, the lab explains that the step view is
unavailable. Unsupported MySQL features and broader SQL diagnostics are being
added in later upgrade phases.

The steps describe SQL's **logical** order. A real database may optimize and
execute a query with a different physical plan.

## Add a challenge

Add one object to `challenges.json` with a unique `id`, a `title`, `difficulty`,
learner-facing `description`, a short `hint`, an `expectedResult`, and a
`solution`:

```json
{
  "id": "employees-in-data",
  "title": "Find the Data team",
  "difficulty": "Beginner",
  "description": "Return the names of employees in Data.",
  "hint": "Join employees to departments on department_id and id.",
  "expectedResult": {
    "query": "SELECT e.name FROM employees e JOIN departments d ON d.id = e.department_id WHERE d.name = 'Data'",
    "orderMatters": false
  },
  "solution": "SELECT e.name FROM employees e JOIN departments d ON d.id = e.department_id WHERE d.name = 'Data';"
}
```

`expectedResult.query` is evaluated against the bundled sample data and is not
shown as the solution. Column names and values are compared; row order is
ignored unless `orderMatters` is `true`. A learner can reveal the solution
after two incorrect, successfully executed attempts.

## Change the schema

1. Edit `schema.sql` and keep it valid SQLite SQL. It is fetched and executed
   into a new in-memory database for each page load and reset.
2. Update `SCHEMA_TABLES` in `engine.js` so the schema browser displays the
   table columns and types.
3. Review the example queries and expected challenge results against the new
   data. Keep the data small enough for fast browser execution.

Queries are restricted to one SELECT statement. SQLite syntax and behavior are
close to the MySQL used in lessons, but they are not identical. MySQL-only
syntax, server behavior, permissions, and query plans are not simulated.
Complex subqueries, CTEs, set operations, and window functions can still show
their final result when SQL.js accepts them, but do not receive an intermediate
step breakdown. The output view shows at most 100 rows.

## Five queries for checking the visual stages

```sql
-- WHERE
SELECT name, salary FROM employees WHERE salary > 90000;

-- JOIN (LEFT JOIN also displays employees without a department)
SELECT e.name, d.name AS department_name
FROM employees AS e LEFT JOIN departments AS d ON e.department_id = d.id;

-- GROUP BY
SELECT status, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders GROUP BY status;

-- HAVING
SELECT d.name, COUNT(e.id) AS employee_count
FROM departments AS d INNER JOIN employees AS e ON e.department_id = d.id
GROUP BY d.id, d.name HAVING COUNT(e.id) >= 2;

-- ORDER BY + LIMIT
SELECT id, amount, status FROM orders ORDER BY amount DESC LIMIT 5;
```

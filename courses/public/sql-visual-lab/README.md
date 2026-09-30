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

The lab has two visibly separate execution modes. **Query Mode** runs one
read-only SELECT-family statement against the original challenge database.
**Sandbox Mode** runs SQL against a second in-memory database created from the
same starter schema and data. Sandbox writes never change the challenge data.
The sandbox starts fresh after a page reload; the page keeps an in-memory
checkpoint of the latest completed run so a worker restart does not erase it.
Undo and Redo retain up to 30 changes under a 32 MB history cap.

In Query Mode, `engine.js` asks node-sql-parser for a MySQL-flavored AST and
builds partial SELECT stages for the supported clause visuals. Window queries
get a partition and calculated-value view. A recursive CTE gets a hierarchy
view when its result includes an id, a parent id (`manager_id`, `parent_id`, or
`reports_to`) and a depth/level column. Other CTEs and complex query shapes can
still return results while the step panel explains why it cannot draw them.

In Sandbox Mode, the worker parses and validates the complete script before
running any statement. It supports SELECT, INSERT/REPLACE, UPDATE, DELETE,
TRUNCATE, SQLite-compatible CREATE/ALTER/DROP operations, and transaction and
savepoint control. It adapts `AUTO_INCREMENT`, `INSERT IGNORE`, and
`ON DUPLICATE KEY UPDATE` to SQLite forms and labels the MySQL differences.
Scripts can stop on the first error or continue. Each statement reports its
result, affected-row count, schema/table snapshots, and transaction state.
UPDATE, DELETE and TRUNCATE without WHERE require an explicit confirmation.
Undo/Redo are disabled while a transaction is open; Reset rebuilds both
in-memory databases from `schema.sql`.

The worker returns at most 5,000 result or trace rows per request and is
terminated and recreated if a request exceeds the configurable 5-second
timeout or the learner cancels it. The output table shows at most 100 rows.

SQL.js does not expose SQLite's authorizer callback. Query Mode adds SQLite's
`query_only` setting to the parser allow-list and single-statement check.
Sandbox Mode uses a separate database, validates each statement against an
explicit type allow-list, blocks PRAGMA/ATTACH/DETACH/VACUUM and extension/file
functions, and caps script length, rows per table, inserts per statement,
database size, and history memory. These browser-side checks are for this
teaching sandbox; they are not a substitute for server-side controls on a real
database. The lab does not send database contents to a server.

The resulting tables and row counts are compared to show filtering, joins,
grouping, projection, sorting, limits, row writes, schema changes, window
partitions, and recursive levels. Group cards and DML diffs use values and
SQLite rowids returned by the worker, so duplicate-valued rows remain distinct
in before-and-after views. Unsupported MySQL syntax can differ from SQLite;
the lab shows the final result when it can execute the statement and explains
the dialect difference where one is known.

The steps describe SQL's **logical** order. A real database may optimize and
execute a query with a different physical plan.

## Check the lab

From the `courses/` directory, run:

```bash
npm run test:sql-visual-lab
```

The Node test suite loads the bundled SQL.js and MySQL parser, then exercises
mode isolation, CRUD traces, MySQL write adaptation, safe-update confirmation,
blocked commands, transactions/savepoints, undo/redo, window partitions, and
recursive hierarchy levels.

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

Query Mode remains restricted to one SELECT statement. Sandbox Mode is an
in-memory teaching database, not a MySQL server: SQLite-specific behavior,
permissions, optimizer plans, and some MySQL multi-table write forms are not
simulated. Window and recursive-hierarchy visuals are educational summaries,
not physical execution plans. The output view shows at most 100 rows.

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

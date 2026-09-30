var e={id:`order-by`,status:`full`,sourceTitle:`ORDER BY`,sourceDocuments:[{title:`ORDER BY`,part:1,topicNumber:9,difficulty:`Beginner`,prerequisites:`select-from-where`}],relatedTopicId:null,sections:{whatIsIt:`ORDER BY sorts your query results. By default, SQL returns rows in an unpredictable order. ORDER BY lets you specify exactly how to sort — by salary (high to low), by name (alphabetically), by hire date (newest first), or any column you choose.

Real-world analogy: Sorting a stack of resumes by experience level, or organizing books alphabetically by author.`,syntaxBreakdown:`SELECT columns
FROM table
WHERE conditions
ORDER BY column_name ASC|DESC;
Breaking it down:

ORDER BY — The sorting clause (always comes after WHERE)
column_name — Which column to sort by
ASC — Ascending order (low to high, A to Z) — this is the default
DESC — Descending order (high to low, Z to A)`,basicExample:`Sort by Salary (Lowest to Highest)
SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1
ORDER BY salary ASC;
Expected output:

first_name	last_name	salary
Leo	Jackson	88000.00
Quinn	Martinez	92000.00
Bob	Smith	95000.00
Jack	Anderson	110000.00
Alice	Johnson	120000.00
Note: ASC is optional (it's the default), so ORDER BY salary gives the same result.

Sort by Salary (Highest to Lowest)
SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1
ORDER BY salary DESC;
Expected output:

first_name	last_name	salary
Alice	Johnson	120000.00
Jack	Anderson	110000.00
Bob	Smith	95000.00
Quinn	Martinez	92000.00
Leo	Jackson	88000.00
This is the most common use case — seeing top earners, most recent records, etc.`,goingDeeper:`Sort by Multiple Columns
SELECT first_name, last_name, department_id, salary
FROM employees
ORDER BY department_id ASC, salary DESC;
What this does:

First, sorts by department_id (ascending)
Within each department, sorts by salary (descending)
Expected output (partial):

first_name	last_name	department_id	salary
Alice	Johnson	1	120000.00
Jack	Anderson	1	110000.00
Bob	Smith	1	95000.00
Quinn	Martinez	1	92000.00
Leo	Jackson	1	88000.00
Carol	Williams	2	78000.00
David	Brown	2	72000.00
Rachel	Robinson	2	71000.00
Use case: "Show me employees grouped by department, with highest earners first in each department."

Sort by String Columns (Alphabetically)
SELECT first_name, last_name
FROM employees
ORDER BY last_name ASC;
Expected output (partial):

first_name	last_name
Jack	Anderson
David	Brown
Sam	Clark
Eve	Davis
Paul	Garcia
Note: Strings sort alphabetically. A comes before B, B before C, etc.

Sort by Date
SELECT first_name, last_name, hire_date
FROM employees
ORDER BY hire_date DESC;
Expected output (partial):

first_name	last_name	hire_date
Paul	Garcia	2023-03-10
Tina	Rodriguez	2023-02-03
Noah	Harris	2023-01-15
Most recent hires appear first with DESC.

Pause and Predict: What does ORDER BY hire_date ASC show?

Answer`,commonMistakes:`Mistake #1: ORDER BY with Column Not in SELECT
-- • This works!
SELECT first_name, last_name
FROM employees
ORDER BY salary DESC;
Surprise: You can ORDER BY a column even if it's not in your SELECT list. MySQL sorts by salary but doesn't show it.

When this is useful: "Show me names sorted by salary" — you want the order but don't need to display the salary itself.

When this is confusing: The order might look random to someone reading the output who doesn't know it's sorted by salary.

Mistake #2: Forgetting DESC (Default is ASC)
-- WRONG if you want highest salaries first
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary;
What happens: Lowest salaries first (ASC is default). If you wanted top earners, you'd see the wrong people at the top.

-- CORRECT for highest salaries first
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC;
Mistake #3: ORDER BY Position in Query
-- WRONG — ORDER BY must come AFTER WHERE
SELECT first_name, last_name, salary
ORDER BY salary DESC
FROM employees
WHERE department_id = 1;
Error: You have an error in your SQL syntax

Correct order:

SELECT
FROM
WHERE (if filtering)
ORDER BY (always last)
-- CORRECT
SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1
ORDER BY salary DESC;`,edgeCaseSpotlight:`NULLs in ORDER BY
MySQL sorts NULL values as "lowest" — they appear first in ASC order, last in DESC order.

SELECT first_name, last_name, salary
FROM employees
ORDER BY salary ASC;
Result: Employees with NULL salaries (Noah, Paul) appear first, then everyone else in ascending salary order.

SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC;
Result: Employees sorted by salary (highest first), then NULL salaries appear at the end.

How to control this:

-- Put NULLs last even in ASC order
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary IS NULL, salary ASC;
How this works: salary IS NULL evaluates to 0 (false) or 1 (true). It sorts false (0) first, so non-NULL salaries appear first.`,tryThis:`Exercise 1 (Guided)
Find all projects, sorted by budget from highest to lowest. Show project_name and budget.

Hint
Exercise 2 (Independent)
Find all employees hired in 2022 or later, sorted by hire date (oldest first within that range). Show their name and hire date.

Exercise 3 (Challenge)
Show all employees sorted first by department_id (ascending), then by hire_date (newest first within each department). Show first_name, last_name, department_id, and hire_date.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• ORDER BY sorts query results
• ASC = ascending (default), DESC = descending
• Can sort by multiple columns — first column breaks ties with second column
• Can ORDER BY columns not in SELECT list
• ORDER BY always comes last in your query (after WHERE)
• NULL values appear first in ASC, last in DESC`,upNext:`Time for a Challenge! → Mini Challenge 3

You've mastered basic querying (SELECT, filtering, ORDER BY). Practice combining these skills with a challenge!`}};export{e as default};
var e={id:`limit`,status:`full`,sourceTitle:`LIMIT`,sourceDocuments:[{title:`LIMIT`,part:1,topicNumber:10,difficulty:`Beginner`,prerequisites:`order-by`}],relatedTopicId:null,sections:{whatIsIt:`LIMIT restricts the number of rows returned by a query. It's perfect for "top N" queries like "show me the 5 highest-paid employees" or for pagination like "show me results 11-20". LIMIT prevents accidentally retrieving millions of rows when you only need a few.

Real-world analogy: A search engine showing "Page 1 of results" — that's LIMIT in action.`,syntaxBreakdown:`SELECT columns
FROM table
WHERE conditions
ORDER BY column
LIMIT number_of_rows;
Or with offset (for pagination):

LIMIT offset, number_of_rows;
LIMIT 10 — Return only the first 10 rows
LIMIT 5, 10 — Skip the first 5 rows, then return the next 10 (rows 6-15)`,basicExample:`Top 5 Highest-Paid Employees
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;
Expected output:

first_name	last_name	salary
Alice	Johnson	120000.00
Mia	White	115000.00
Jack	Anderson	110000.00
Karen	Thomas	105000.00
Olivia	Martin	98000.00
How it works: ORDER BY sorts by salary (highest first), then LIMIT stops after 5 rows.

First 3 Employees (by employee_id)
SELECT employee_id, first_name, last_name
FROM employees
ORDER BY employee_id ASC
LIMIT 3;
Expected output:

employee_id	first_name	last_name
1	Alice	Johnson
2	Bob	Smith
3	Carol	Williams`,goingDeeper:`LIMIT with Offset (Pagination)
Show employees 6-10 when sorted by salary (descending):

SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5, 5;
What this does:

LIMIT 5, 5 = Skip first 5 rows, return next 5 rows
Syntax: LIMIT offset, count
Expected output: Employees ranked 6-10 by salary.

Pagination pattern:

Page 1 (rows 1-10): LIMIT 0, 10
Page 2 (rows 11-20): LIMIT 10, 10
Page 3 (rows 21-30): LIMIT 20, 10
Pause and Predict: For Page 5 showing 10 results per page, what's the LIMIT clause?

Answer
Alternative OFFSET Syntax (MySQL 8+)
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5 OFFSET 5;
Same as: LIMIT 5, 5

This syntax is clearer: "LIMIT 5 rows, starting OFFSET 5"

LIMIT Without ORDER BY (Unpredictable!)
SELECT first_name, last_name
FROM employees
LIMIT 3;
What happens: Returns 3 rows, but which 3 is unpredictable. MySQL returns them in whatever order they're stored internally.

Best practice: Always use LIMIT with ORDER BY unless you genuinely don't care which rows you get.`,commonMistakes:`Mistake #1: LIMIT Before ORDER BY
-- WRONG — Syntax error
SELECT first_name, last_name, salary
FROM employees
LIMIT 5
ORDER BY salary DESC;
Error: You have an error in your SQL syntax

Correct order:

SELECT
FROM
WHERE (if filtering)
ORDER BY (if sorting)
LIMIT (always last)
-- CORRECT
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;
Mistake #2: Thinking LIMIT Affects Performance of WHERE
SELECT * FROM employees
WHERE salary > 50000
LIMIT 5;
What beginners think: "MySQL finds 5 employees with salary > 50000, then stops"

What actually happens: MySQL finds ALL employees with salary > 50000, then returns only 5 of them. LIMIT is applied AFTER the WHERE clause evaluates.

For small tables (like ours), this doesn't matter. For tables with millions of rows:

WHERE still scans the whole dataset
LIMIT just limits the output
Use indexes to speed up WHERE (advanced topic)
Mistake #3: Offset Math Errors
-- WRONG for Page 2 of 10 results per page
SELECT * FROM employees
ORDER BY employee_id
LIMIT 10, 20;  -- This skips 10, then returns 20 rows (rows 11-30)
What you wanted: Rows 11-20 (Page 2, 10 results per page)

-- CORRECT
SELECT * FROM employees
ORDER BY employee_id
LIMIT 10, 10;  -- Skip 10, return 10 (rows 11-20)`,edgeCaseSpotlight:`LIMIT with Fewer Rows Available
SELECT first_name, last_name
FROM employees
WHERE department_id = 1
LIMIT 100;
What happens: There are only 5 employees in department 1. MySQL returns all 5 — it doesn't error because you asked for 100.

Lesson: LIMIT is a maximum, not a guarantee. If fewer rows match, you get fewer rows.

LIMIT 1 for "First Match"
SELECT first_name, last_name, salary
FROM employees
WHERE salary > 100000
ORDER BY salary DESC
LIMIT 1;
Use case: "Who is the highest-paid employee making over $100K?"

Result: Alice Johnson ($120,000)

Why LIMIT 1 is useful:

Guarantees only one row returned
Makes your intent clear (you want a single result)
Slightly more efficient (MySQL can stop as soon as it finds 1 match)`,tryThis:`Exercise 1 (Guided)
Find the 3 most recent projects (by start_date). Show project_name and start_date.

Hint
Exercise 2 (Independent)
Show employees 11-15 when sorted alphabetically by last name. Include first_name and last_name.

Hint
Exercise 3 (Challenge)
Find the employee with the lowest salary who was hired after 2020. Show their name, salary, and hire date.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• LIMIT restricts the number of rows returned
• Perfect for "top N" queries and pagination
• Syntax: LIMIT count or LIMIT offset, count
• Always use with ORDER BY (otherwise results are unpredictable)
• LIMIT always comes last in your query
• If fewer rows exist, LIMIT returns what's available (no error)`,upNext:`Next topic: Aggregate Functions (COUNT, SUM, AVG, MIN, MAX) → part1_11_aggregate_functions.md

You can now filter, sort, and limit results. Next, you'll learn how to summarize data — counting rows, calculating averages, finding totals!`}};export{e as default};
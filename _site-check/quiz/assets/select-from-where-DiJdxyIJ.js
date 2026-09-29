var e={id:`select-from-where`,status:`full`,sourceTitle:`SELECT with FROM and WHERE`,sourceDocuments:[{title:`SELECT with FROM and WHERE`,part:1,topicNumber:7,difficulty:`Beginner`,prerequisites:`insert`}],relatedTopicId:null,sections:{whatIsIt:`SELECT is the most important command in SQL. It retrieves data from tables. Think of it as asking questions: "Show me all employees" or "Find employees in the Engineering department". Every data analysis, report, or dashboard starts with SELECT.

The FROM clause specifies which table(s) to query. The WHERE clause filters the results to only rows that match your conditions.

Real-world analogy: FROM is choosing which filing cabinet to search. WHERE is specifying which folders inside that cabinet you want to see.`,syntaxBreakdown:`SELECT column1, column2, column3, ...
FROM table_name
WHERE condition;
Breaking it down:

SELECT — What columns you want to see
column1, column2, ... — Specific column names (or * for all columns)
FROM — Which table to query
table_name — The table containing your data
WHERE — Optional filter that limits which rows are returned
condition — The filtering logic (more on this soon)`,basicExample:`Let's find all employees in the Engineering department (department_id = 1):

SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1;
What this does:

Looks at the employees table
Filters for only rows where department_id = 1
Returns only the first_name, last_name, and salary columns
Expected output:

first_name	last_name	salary
Alice	Johnson	120000.00
Bob	Smith	95000.00
Jack	Anderson	110000.00
Leo	Jackson	88000.00
Quinn	Martinez	92000.00
SELECT All Columns with *
If you want to see all columns, use *:

SELECT *
FROM employees
WHERE department_id = 1;
This returns every column: employee_id, first_name, last_name, department_id, salary, hire_date, manager_id.

Best practice: In production code, list specific columns. SELECT * is great for exploration, but explicit column names make your code clearer and more maintainable.`,goingDeeper:`SELECT Without WHERE
SELECT first_name, last_name
FROM employees;
What this does:

Returns ALL employees (no filtering)
Shows only first_name and last_name columns
Expected output: All 20 employees.

When to omit WHERE: When you genuinely want all rows. But be careful with large tables — selecting millions of rows can be slow!

Multiple Conditions in WHERE
You can combine conditions with AND and OR:

SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1 AND salary > 100000;
What this does:

Filters for Engineering employees (department_id = 1)
AND salary greater than $100,000
Both conditions must be true
Expected output:

first_name	last_name	salary
Alice	Johnson	120000.00
Jack	Anderson	110000.00
Using OR
SELECT first_name, last_name, department_id
FROM employees
WHERE department_id = 1 OR department_id = 2;
What this does:

Returns employees in Engineering (1) OR Marketing (2)
Only one condition needs to be true
Pause and Predict: How many employees will this return?

Answer
Combining AND and OR
SELECT first_name, last_name, salary, department_id
FROM employees
WHERE (department_id = 1 OR department_id = 2) AND salary > 90000;
What this does:

Employees in Engineering OR Marketing
AND salary over $90,000
Important: Parentheses matter! They control the order of evaluation, just like in math.

Expected output:

first_name	last_name	salary	department_id
Alice	Johnson	120000.00	1
Bob	Smith	95000.00	1
Jack	Anderson	110000.00	1
Quinn	Martinez	92000.00	1`,commonMistakes:`Mistake #1: Forgetting Quotes Around Strings
-- WRONG
SELECT * FROM employees WHERE first_name = Alice;
Error: Unknown column 'Alice' in 'where clause'

MySQL thinks Alice is a column name, not a string value.

-- CORRECT
SELECT * FROM employees WHERE first_name = 'Alice';
Rule: Strings need single quotes. Numbers don't.

Mistake #2: Using = Instead of LIKE for Partial Matches
-- WRONG (finds nothing if no exact match)
SELECT * FROM employees WHERE first_name = 'Ali';
Returns: Empty set (no one is named exactly "Ali")

-- CORRECT (finds names starting with "Ali")
SELECT * FROM employees WHERE first_name LIKE 'Ali%';
Returns: Alice Johnson (we'll cover LIKE in detail in the next topic)

Mistake #3: Wrong AND/OR Logic Without Parentheses
--  AMBIGUOUS
SELECT * FROM employees 
WHERE department_id = 1 OR department_id = 2 AND salary > 100000;
What does this mean?

Option A: (dept 1 OR dept 2) AND salary > 100K
Option B: dept 1 OR (dept 2 AND salary > 100K)
MySQL chooses Option B because AND has higher precedence than OR. You might get unexpected results!

-- CORRECT — Use parentheses to be explicit
SELECT * FROM employees 
WHERE (department_id = 1 OR department_id = 2) AND salary > 100000;
Best practice: Always use parentheses when mixing AND and OR. Don't rely on precedence rules.`,edgeCaseSpotlight:`Comparing NULL Values
-- WRONG
SELECT * FROM employees WHERE manager_id = NULL;
Returns: Empty set (even though Alice has manager_id = NULL)

Why it fails: NULL means "unknown". You can't compare anything to unknown using =. NULL = NULL is not true — it's NULL (unknown)!

-- CORRECT
SELECT * FROM employees WHERE manager_id IS NULL;
Returns: Alice Johnson (the only employee with no manager)

Remember: Use IS NULL and IS NOT NULL, never = NULL or != NULL. We'll cover this deeply in the NULL handling topic.`,tryThis:`Exercise 1 (Guided)
Find all employees with a salary greater than or equal to $100,000. Show their first name, last name, and salary.

Hint
Exercise 2 (Independent)
Find all projects that have NOT ended yet (end_date is NULL). Show the project name and start date.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer`,quickRecap:`• SELECT retrieves data from tables
• FROM specifies which table to query
• WHERE filters rows based on conditions
• Use AND when all conditions must be true, OR when any condition can be true
• Always use parentheses when mixing AND and OR
• Use IS NULL for NULL comparisons, not = NULL`,upNext:`Next topic: Filtering Data → part1_08_filtering.md

You can now retrieve and filter data with basic conditions. Next, you'll learn advanced filtering operators like LIKE, IN, and BETWEEN!`}};export{e as default};
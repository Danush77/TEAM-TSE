var e={id:`count`,status:`full`,sourceTitle:`Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)`,sourceDocuments:[{title:`Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)`,part:1,topicNumber:11,difficulty:`Beginner`,prerequisites:`select-from-where`}],relatedTopicId:null,sections:{whatIsIt:`Aggregate Functions
Aggregate functions perform calculations across multiple rows and return a single result. Instead of showing every row, they summarize data: COUNT how many rows, SUM totals, AVG calculates averages, MIN/MAX find extremes.

Real-world analogy: Instead of listing every employee's salary, answer "What's the total payroll?" or "What's the average salary?"

The Five Core Aggregate Functions
Function	What It Does	Example
COUNT()	Counts rows	How many employees?
SUM()	Adds up values	What's total payroll?
AVG()	Calculates average	What's average salary?
MIN()	Finds minimum value	Who has lowest salary?
MAX()	Finds maximum value	Who has highest salary?`,syntaxBreakdown:``,basicExample:`COUNT — How Many?
Count all employees:

SELECT COUNT(*) AS total_employees
FROM employees;
Expected output:

total_employees
20
Explanation: COUNT(*) counts all rows, regardless of NULL values.

Count employees with assigned salaries (non-NULL):

SELECT COUNT(salary) AS employees_with_salary
FROM employees;
Expected output:

employees_with_salary
18
Why 18, not 20? Two employees (Noah and Paul) have NULL salaries. COUNT(column_name) ignores NULLs.

SUM — Add Them Up
Total payroll (sum of all salaries):

SELECT SUM(salary) AS total_payroll
FROM employees;
Expected output:

total_payroll
1633000.00
Note: NULL salaries are ignored. SUM only adds non-NULL values.

AVG — Calculate Average
Average salary:

SELECT AVG(salary) AS average_salary
FROM employees;
Expected output:

average_salary
90722.22
Calculation: Total payroll ÷ number of non-NULL salaries = 1,633,000 ÷ 18 ≈ 90,722.22

MIN and MAX — Find Extremes
Lowest and highest salaries:

SELECT 
    MIN(salary) AS lowest_salary,
    MAX(salary) AS highest_salary
FROM employees;
Expected output:

lowest_salary	highest_salary
55000.00	120000.00
You can use multiple aggregates in one query!`,goingDeeper:`Combining Aggregates
Get a complete salary summary:

SELECT 
    COUNT(*) AS total_employees,
    COUNT(salary) AS employees_with_salary,
    SUM(salary) AS total_payroll,
    AVG(salary) AS average_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees;
Expected output:

total_employees	employees_with_salary	total_payroll	average_salary	min_salary	max_salary
20	18	1633000.00	90722.22	55000.00	120000.00
Powerful summary in one query!

Aggregate with WHERE
Average salary for Engineering department:

SELECT AVG(salary) AS avg_engineering_salary
FROM employees
WHERE department_id = 1;
Expected output:

avg_engineering_salary
101000.00
Order of execution:

WHERE filters rows (only dept 1)
AVG calculates on the filtered results
COUNT DISTINCT — Count Unique Values
How many unique departments have employees?

SELECT COUNT(DISTINCT department_id) AS departments_with_employees
FROM employees;
Expected output:

departments_with_employees
9
Why 9? Even though we have 10 departments, one department has no employees (or Paul has NULL department_id), so distinct non-NULL department_ids = 9.

Pause and Predict: What does COUNT(DISTINCT salary) return?

Answer`,commonMistakes:`Mistake #1: COUNT(*) vs COUNT(column) — NULL Behavior
SELECT COUNT(*) AS all_rows, COUNT(manager_id) AS has_manager
FROM employees;
Expected output:

all_rows	has_manager
20	19
Why different?

COUNT(*) counts all rows (20)
COUNT(manager_id) counts only non-NULL manager_ids (19 — Alice has NULL)
KEY RULE: COUNT(*) counts rows. COUNT(column) counts non-NULL values in that column.

Mistake #2: Mixing Aggregates with Non-Aggregated Columns
-- WRONG
SELECT first_name, AVG(salary)
FROM employees;
Why it's wrong: You're asking "Show me a name AND the average of all salaries." Which name should MySQL show when there are 20 names but only 1 average?

Error (in strict SQL mode): Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated column

The fix: Either:

Remove first_name (just show the aggregate)
Use GROUP BY (next topic!)
-- CORRECT option 1
SELECT AVG(salary) AS average_salary
FROM employees;

-- CORRECT option 2 (requires GROUP BY — next topic)
SELECT department_id, AVG(salary)
FROM employees
GROUP BY department_id;
Mistake #3: NULL + Anything = NULL in Arithmetic
SELECT SUM(salary) / COUNT(*) AS incorrect_average
FROM employees;
What you get: 81,650.00

What you expected: 90,722.22 (the real average)

Why different? COUNT(*) counts all 20 employees, including 2 with NULL salaries. But SUM(salary) only adds the 18 non-NULL salaries. So you're dividing by 20 instead of 18.

The fix: Use AVG() which handles NULLs correctly:

-- CORRECT
SELECT AVG(salary) AS correct_average
FROM employees;`,edgeCaseSpotlight:`Aggregates on Empty Result Sets
SELECT COUNT(*), SUM(salary), AVG(salary), MIN(salary), MAX(salary)
FROM employees
WHERE department_id = 999;  -- No such department
Expected output:

COUNT(*)	SUM(salary)	AVG(salary)	MIN(salary)	MAX(salary)
0	NULL	NULL	NULL	NULL
Key points:

COUNT(*) returns 0 (zero rows found)
All other aggregates return NULL (can't sum/average/min/max nothing)
Why this matters: Your application should handle NULL results from aggregates when no rows match.`,tryThis:`Exercise 1 (Guided)
Find the total budget across all projects (include only projects with non-NULL budgets).

Hint
Exercise 2 (Independent)
Find:

How many projects exist
How many have assigned budgets (non-NULL)
The average budget
Show all three in one query.

Exercise 3 (Challenge)
Find the earliest hire date and the most recent hire date among all employees. Label them as first_hire and most_recent_hire.

Hint`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• COUNT() counts rows; COUNT(*) includes NULLs, COUNT(column) excludes NULLs
• SUM() adds up numeric values, ignoring NULLs
• AVG() calculates average, ignoring NULLs
• MIN()/MAX() find smallest/largest values
• Can't mix regular columns with aggregates without GROUP BY
• Aggregates on empty results return 0 (COUNT) or NULL (others)`,upNext:`Next topic: GROUP BY → part1_12_group_by.md

You can summarize ALL data. Next, you'll learn how to summarize data BY CATEGORY — like average salary per department!`}};export{e as default};
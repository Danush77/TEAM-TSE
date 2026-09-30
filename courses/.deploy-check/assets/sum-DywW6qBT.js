var e={id:`sum`,status:`reference`,sourceTitle:`Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)`,sourceDocuments:[{title:`Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)`,part:1,topicNumber:11,difficulty:`Beginner`,prerequisites:`select-from-where`}],relatedTopicId:`count`,sections:{whatIsIt:`Aggregate Functions
Aggregate functions perform calculations across multiple rows and return a single result. Instead of showing every row, they summarize data: COUNT how many rows, SUM totals, AVG calculates averages, MIN/MAX find extremes.

Real-world analogy: Instead of listing every employee's salary, answer "What's the total payroll?" or "What's the average salary?"

The Five Core Aggregate Functions
Function	What It Does	Example
COUNT()	Counts rows	How many employees?
SUM()	Adds up values	What's total payroll?
AVG()	Calculates average	What's average salary?
MIN()	Finds minimum value	Who has lowest salary?
MAX()	Finds maximum value	Who has highest salary?`,syntaxBreakdown:``,basicExample:`SUM — Add Them Up
Total payroll (sum of all salaries):

SELECT SUM(salary) AS total_payroll
FROM employees;
Expected output:

total_payroll
1633000.00
Note: NULL salaries are ignored. SUM only adds non-NULL values.`,goingDeeper:`Combining Aggregates
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
Powerful summary in one query!`,commonMistakes:`Mistake #3: NULL + Anything = NULL in Arithmetic
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

Hint`,answerKey:`Exercise 1 Answer`,quickRecap:`• SUM() adds up numeric values, ignoring NULLs`,upNext:`Next topic: GROUP BY → part1_12_group_by.md

You can summarize ALL data. Next, you'll learn how to summarize data BY CATEGORY — like average salary per department!`}};export{e as default};
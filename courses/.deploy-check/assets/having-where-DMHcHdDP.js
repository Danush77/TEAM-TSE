var e={id:`having-where`,status:`full`,sourceTitle:`HAVING vs WHERE`,sourceDocuments:[{title:`HAVING vs WHERE`,part:1,topicNumber:13,difficulty:`Beginner`,prerequisites:`group-by, aggregate-functions`}],relatedTopicId:null,sections:{whatIsIt:`WHERE filters rows BEFORE grouping. HAVING filters groups AFTER aggregation. Think of WHERE as "which employees should I include?" and HAVING as "which department summaries should I show?"

Real-world analogy: WHERE is like filtering attendees before a meeting. HAVING is like filtering meeting groups based on attendance count ("only show meetings with 5+ people").

The Key Difference
WHERE:

Filters individual rows
Applied BEFORE GROUP BY
Cannot use aggregate functions
Filters the raw data
HAVING:

Filters groups (after aggregation)
Applied AFTER GROUP BY
CAN use aggregate functions
Filters the summary results`,syntaxBreakdown:``,basicExample:`WHERE — Filter Rows Before Grouping
Show average salary per department, but only include employees earning over $70K:

SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE salary > 70000
GROUP BY department_id;
What happens:

WHERE removes employees with salary ≤ $70K
GROUP BY groups the remaining employees by department
AVG calculates on each group
Expected output:

department_id	avg_salary
1	101000.00
2	74500.00
3	85000.00
...	...
HAVING — Filter Groups After Aggregation
Show departments where the average salary is over $80K:

SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 80000;
What happens:

GROUP BY groups all employees by department
AVG calculates for each department
HAVING filters out departments where average ≤ $80K
Expected output:

department_id	avg_salary
1	101000.00
5	90000.00
7	105000.00
8	115000.00
10	98000.00
Only 5 departments meet the criteria.`,goingDeeper:`Using Both WHERE and HAVING
Show departments with average salary > $80K, but only count employees hired after 2020:

SELECT department_id, AVG(salary) AS avg_salary, COUNT(*) AS recent_hires
FROM employees
WHERE hire_date > '2020-12-31'
GROUP BY department_id
HAVING AVG(salary) > 80000;
Execution order:

WHERE filters: only employees hired after 2020
GROUP BY: groups filtered employees by department
Aggregates: calculates AVG and COUNT per group
HAVING: keeps only groups where average > $80K
Expected output:

department_id	avg_salary	recent_hires
1	90000.00	2
10	98000.00	1
HAVING with COUNT
Show departments with more than 2 employees:

SELECT department_id, COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 2;
Expected output:

department_id	employee_count
1	5
2	3
3	3
Use case: "Find busy departments" — filtering based on group size.

HAVING with Multiple Conditions
Find departments with 2+ employees AND average salary > $70K:

SELECT 
    department_id, 
    COUNT(*) AS emp_count,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING COUNT(*) >= 2 AND AVG(salary) > 70000;
Expected output:

department_id	emp_count	avg_salary
1	5	101000.00
2	3	73666.67
3	3	73333.33
Pause and Predict: Can you use WHERE and HAVING on the same column?

Answer`,commonMistakes:`Mistake #1: Using Aggregate Functions in WHERE
-- WRONG
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE AVG(salary) > 80000  -- ERROR!
GROUP BY department_id;
Error: Invalid use of group function

Why it fails: WHERE runs BEFORE grouping, so aggregates don't exist yet. You can't filter by something that hasn't been calculated.

-- CORRECT
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 80000;
Mistake #2: Using HAVING Without GROUP BY
--  CONFUSING (but technically works in MySQL)
SELECT * FROM employees
HAVING salary > 80000;
What happens: MySQL treats this like WHERE. It works, but it's confusing and non-standard.

Best practice: Use WHERE when not grouping, HAVING only with GROUP BY.

-- CORRECT — Use WHERE when not grouping
SELECT * FROM employees
WHERE salary > 80000;
Mistake #3: Column Alias in HAVING (Doesn't Always Work)
--  MIGHT WORK, might not (depends on MySQL version/settings)
SELECT department_id, AVG(salary) AS avg_sal
FROM employees
GROUP BY department_id
HAVING avg_sal > 80000;  -- Referencing alias
In MySQL 8+, this works! But in older versions or strict SQL, you must repeat the aggregate:

-- • ALWAYS WORKS
SELECT department_id, AVG(salary) AS avg_sal
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 80000;  -- Repeat the function
Safest approach: Repeat the aggregate in HAVING to ensure compatibility.`,edgeCaseSpotlight:`Query Execution Order (The Secret Sauce)
SQL queries execute in this order (not the order you write them):

FROM — Choose the table
WHERE — Filter individual rows
GROUP BY — Group rows
Aggregates — Calculate SUM, AVG, COUNT, etc.
HAVING — Filter groups
SELECT — Choose columns to display
ORDER BY — Sort results
LIMIT — Restrict number of rows returned
Why this matters:

WHERE comes before GROUP BY → can't use aggregates in WHERE
HAVING comes after aggregates → can use aggregates in HAVING
ORDER BY comes after SELECT → can reference column aliases
Memorize this order and you'll never confuse WHERE vs HAVING again!`,tryThis:`Exercise 1 (Guided)
Find projects with 2 or more employees assigned. Show project_id and the count of employees. (Use the employee_projects table.)

Hint
Exercise 2 (Independent)
Find departments where:

Only count employees with salary > $70,000
The department must have at least 2 such employees
Show department_id and the count
Exercise 3 (Challenge)
Find managers (manager_id) who manage at least 3 people AND those people have an average salary over $75,000. Show manager_id, count of reports, and average salary of reports.

Hint`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• WHERE filters individual rows before grouping
• HAVING filters groups after aggregation
• WHERE cannot use aggregate functions; HAVING can
• You can use both WHERE and HAVING in the same query
• SQL execution order: FROM → WHERE → GROUP BY → Aggregates → HAVING → SELECT → ORDER BY → LIMIT
• Use HAVING only with GROUP BY for clarity`,upNext:`Next topic: Primary Key and Foreign Key Concepts → part1_14_primary_foreign_keys.md

You've mastered data querying and aggregation! Next, you'll learn the foundational concepts of database relationships — how tables connect to each other!`}};export{e as default};
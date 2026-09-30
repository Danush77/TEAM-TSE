var e={id:`group-by`,status:`full`,sourceTitle:`GROUP BY`,sourceDocuments:[{title:`GROUP BY`,part:1,topicNumber:12,difficulty:`Beginner`,prerequisites:`aggregate-functions`}],relatedTopicId:null,sections:{whatIsIt:`GROUP BY splits your data into categories, then calculates aggregates for each category separately. Instead of "What's the average salary company-wide?", you can ask "What's the average salary in EACH department?"

Real-world analogy: Instead of calculating the total sales for your entire company, calculate total sales per region.`,syntaxBreakdown:`SELECT column, AGG_FUNCTION(column)
FROM table
WHERE conditions
GROUP BY column
ORDER BY column;
Breaking it down:

GROUP BY column — Split rows into groups based on unique values in this column
For each group, calculate the aggregate function
Return one row per group
Critical rule: Every column in SELECT must either be:

In the GROUP BY clause, OR
Inside an aggregate function (COUNT, SUM, AVG, MIN, MAX)`,basicExample:`Average salary by department:

SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;
What this does:

Groups employees by department_id
Calculates AVG(salary) for each group
Returns one row per department
Expected output:

department_id	avg_salary
1	101000.00
2	73666.67
3	73333.33
4	65000.00
5	90000.00
6	56500.00
7	105000.00
8	115000.00
9	NULL
10	98000.00
NULL	60000.00
Note: Department 9 shows NULL average (Noah has NULL salary). Paul (NULL department) also appears.`,goingDeeper:`Multiple Aggregates per Group
SELECT 
    department_id,
    COUNT(*) AS num_employees,
    AVG(salary) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees
GROUP BY department_id
ORDER BY department_id;
Expected output (partial):

department_id	num_employees	avg_salary	min_salary	max_salary
1	5	101000.00	88000.00	120000.00
2	3	73666.67	71000.00	78000.00
3	3	73333.33	67000.00	85000.00
Powerful insights! Now you see headcount AND salary stats per department.

GROUP BY with WHERE
Count employees per department, but only for those earning over $70K:

SELECT department_id, COUNT(*) AS high_earners
FROM employees
WHERE salary > 70000
GROUP BY department_id;
Order of execution:

WHERE filters employees (only salary > 70K)
GROUP BY splits filtered results by department
COUNT counts rows in each group
Expected output:

department_id	high_earners
1	5
2	2
3	1
5	1
7	1
8	1
10	1
GROUP BY Multiple Columns
Count employees by department AND manager:

SELECT department_id, manager_id, COUNT(*) AS team_size
FROM employees
GROUP BY department_id, manager_id
ORDER BY department_id, manager_id;
What this does: Groups by the COMBINATION of department and manager. Each unique pair gets its own group.

Expected output (partial):

department_id	manager_id	team_size
1	1	3
1	10	2
2	1	1
2	3	2
Interpretation:

In dept 1, Alice (manager_id=1) manages 3 people
In dept 1, Jack (manager_id=10) manages 2 people
Pause and Predict: What happens if you GROUP BY department_id but SELECT first_name (which isn't aggregated)?

Answer`,commonMistakes:`Mistake #1: SELECT Column Not in GROUP BY
-- WRONG
SELECT department_id, first_name, AVG(salary)
FROM employees
GROUP BY department_id;
Error: first_name isn't in GROUP BY and isn't aggregated. Which first_name should MySQL show for each department when there are multiple employees per department?

The fix:

-- CORRECT — Remove first_name
SELECT department_id, AVG(salary)
FROM employees
GROUP BY department_id;

-- • OR group by both (but this changes the meaning)
SELECT department_id, first_name, AVG(salary)
FROM employees
GROUP BY department_id, first_name;  -- Now groups by combination of dept+name
Mistake #2: WHERE vs HAVING (Filtering Groups)
-- WRONG — WHERE can't filter aggregates
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE AVG(salary) > 80000  -- ERROR!
GROUP BY department_id;
Error: Invalid use of group function

Why it fails: WHERE filters rows BEFORE grouping. Aggregates don't exist yet!

The fix: Use HAVING (next topic!) to filter groups:

-- CORRECT (preview of next topic)
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 80000;
Mistake #3: GROUP BY Order Matters (for Multiple Columns)
-- These produce different results!
GROUP BY department_id, manager_id
GROUP BY manager_id, department_id
Actually, in MySQL, the ORDER doesn't change the results — the groups are the same. But the conceptual grouping is different:

First groups by dept, then splits each dept by manager
Second groups by manager, then splits each manager by dept
Best practice: List GROUP BY columns in logical order (usually matching your SELECT order) for readability.`,edgeCaseSpotlight:`NULL in GROUP BY
SELECT manager_id, COUNT(*) AS direct_reports
FROM employees
GROUP BY manager_id;
Expected output includes:

manager_id	direct_reports
NULL	2
1	10
3	2
5	2
7	2
10	2
Key point: NULL is treated as its own group. Employees with NULL manager_id (Alice and Paul) are grouped together.

This is different from WHERE, where NULL comparisons need IS NULL. In GROUP BY, NULL values automatically group together.`,tryThis:`Exercise 1 (Guided)
Count how many employees are in each department. Show department_id and the count. Sort by count (descending) to see which department is largest.

Hint
Exercise 2 (Independent)
For each project, calculate the total number of employees assigned to it. Show project_id and the count. (Hint: Use the employee_projects table.)

Exercise 3 (Challenge)
Find the total budget per year for projects. Extract the year from start_date using YEAR() function, group by that year, and SUM the budgets. Sort by year.

Hint`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• GROUP BY splits data into categories and calculates aggregates per category
• Every SELECT column must be in GROUP BY OR inside an aggregate function
• WHERE filters rows before grouping; HAVING filters groups after (next topic)
• Can GROUP BY multiple columns for sub-categories
• NULL values form their own group
• ORDER BY should reference columns in SELECT list`,upNext:`Time for a Challenge! → Mini Challenge 4

You've learned aggregation and grouping! Test your skills with a challenge before moving to HAVING.`}};export{e as default};
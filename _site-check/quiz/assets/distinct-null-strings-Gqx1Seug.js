var e={id:`distinct-null-strings`,status:`full`,sourceTitle:`DISTINCT / NULL Handling (IS NULL / IS NOT NULL) / String Functions (UPPER, LOWER)`,sourceDocuments:[{title:`DISTINCT`,part:1,topicNumber:18,difficulty:`Beginner`,prerequisites:`select-from-where`},{title:`NULL Handling (IS NULL / IS NOT NULL)`,part:1,topicNumber:19,difficulty:`Beginner`,prerequisites:`select-from-where`},{title:`String Functions (UPPER, LOWER)`,part:1,topicNumber:20,difficulty:`Beginner`,prerequisites:`select-from-where`}],relatedTopicId:null,sections:{whatIsIt:`DISTINCT eliminates duplicate rows from your query results. If two rows have identical values in all selected columns, only one is kept. It's like saying "show me unique values only."

Real-world analogy: A list of unique cities where your customers live, not every customer address (which would have duplicates).


NULL Handling
NULL represents "unknown" or "missing" data — not zero, not empty string, but the absence of a value. NULL behaves differently from regular values, and you need special operators (IS NULL / IS NOT NULL) to work with it.

Real-world analogy: A form field left blank. It's not that the answer is "0" or "" — it's that no answer was provided.

Understanding NULL
NULL is NOT Zero
SELECT * FROM employees WHERE salary = 0;  -- Finds employees with $0 salary
SELECT * FROM employees WHERE salary IS NULL;  -- Finds employees with NO salary info
These are different!

salary = 0 → The salary exists and is zero dollars
salary IS NULL → No salary information exists
NULL is NOT Empty String
SELECT * FROM employees WHERE first_name = '';  -- Finds employees with empty string name
SELECT * FROM employees WHERE first_name IS NULL;  -- Finds employees with NO name
Again, different!

first_name = '' → Name exists but is empty
first_name IS NULL → No name was provided


String functions manipulate text data. UPPER() converts text to uppercase, LOWER() converts to lowercase. They're perfect for normalizing data, making case-insensitive comparisons, and formatting output.

Real-world analogy: Like the "Caps Lock" key — UPPER() turns everything to capitals, LOWER() turns everything to lowercase.`,syntaxBreakdown:`DISTINCT

SELECT DISTINCT column1, column2, ...
FROM table
WHERE conditions;
Key points:

DISTINCT goes right after SELECT
Applies to the entire row of selected columns
Returns each unique combination only once

String Functions (UPPER, LOWER)

UPPER(column_or_string)  -- Converts to UPPERCASE
LOWER(column_or_string)  -- Converts to lowercase
Key points:

Takes a string argument (column name or literal string)
Returns a new string (doesn't modify the original data in the database)
Works on any text data (VARCHAR, TEXT, CHAR)`,basicExample:`DISTINCT

Unique Department IDs
Find which departments have employees (no duplicates):

SELECT DISTINCT department_id
FROM employees;
Without DISTINCT:

department_id
1
1
2
2
2
3
3
... (20 rows)
With DISTINCT:

department_id
1
2
3
4
5
6
7
8
9
10
NULL
Much cleaner! Only 11 unique values instead of 20 rows.

Unique Locations
Find all unique office locations:

SELECT DISTINCT location
FROM departments;
Expected output:

location
San Francisco
New York
Austin
Chicago
Boston
Remote
Seattle
NULL
8 unique locations (including NULL).

NULL Handling (IS NULL / IS NOT NULL)

Find Employees with No Salary
SELECT first_name, last_name, salary
FROM employees
WHERE salary IS NULL;
Expected output:

first_name	last_name	salary
Noah	Harris	NULL
Paul	Garcia	NULL
Cannot use = NULL! Always use IS NULL.

Find Employees with a Salary
SELECT first_name, last_name, salary
FROM employees
WHERE salary IS NOT NULL;
Expected output: All 18 employees who have salaries assigned.

String Functions (UPPER, LOWER)

Convert Names to Uppercase
SELECT 
    first_name,
    UPPER(first_name) AS first_name_upper,
    last_name,
    UPPER(last_name) AS last_name_upper
FROM employees
LIMIT 5;
Expected output:

first_name	first_name_upper	last_name	last_name_upper
Alice	ALICE	Johnson	JOHNSON
Bob	BOB	Smith	SMITH
Carol	CAROL	Williams	WILLIAMS
David	DAVID	Brown	BROWN
Eve	EVE	Davis	DAVIS
The original data is unchanged — we're just transforming the display.

Convert to Lowercase
SELECT 
    department_name,
    LOWER(department_name) AS department_lower
FROM departments
LIMIT 5;
Expected output:

department_name	department_lower
Engineering	engineering
Marketing	marketing
Sales	sales
Human Resources	human resources
Finance	finance`,goingDeeper:`DISTINCT

DISTINCT on Multiple Columns
DISTINCT applies to the entire row, not individual columns:

SELECT DISTINCT department_id, manager_id
FROM employees;
What this returns: Unique COMBINATIONS of (department_id, manager_id).

Expected output (partial):

department_id	manager_id
1	1
1	10
2	1
2	3
3	1
3	5
Each row is unique — maybe multiple employees have dept=1 and manager=1, but that combination appears only once.

Pause and Predict: What does SELECT DISTINCT first_name, last_name return if two employees have the same full name?

Answer
DISTINCT vs GROUP BY
These are similar but not identical:

Using DISTINCT:

SELECT DISTINCT department_id
FROM employees;
Using GROUP BY:

SELECT department_id
FROM employees
GROUP BY department_id;
Both return the same unique department_ids!

When to use each:

DISTINCT: Simple deduplication, no aggregation
GROUP BY: When you also need aggregates (COUNT, SUM, etc.)
Example needing GROUP BY:

SELECT department_id, COUNT(*) AS employee_count
FROM employees
GROUP BY department_id;
You can't do this with DISTINCT — you need GROUP BY for aggregates.

DISTINCT with ORDER BY
SELECT DISTINCT location
FROM departments
ORDER BY location;
Expected output:

location
Austin
Boston
Chicago
New York
Remote
San Francisco
Seattle
NULL
NULLs sort first in ASC order (MySQL default).

NULL Handling (IS NULL / IS NOT NULL)

NULL in Comparisons (Always False/Unknown)
-- These all return FALSE (or NULL, technically)
NULL = NULL  -- Not TRUE!
NULL != NULL
NULL > 100
NULL < 100
100 + NULL
Key rule: Any comparison with NULL results in NULL (unknown), which is treated as FALSE in WHERE clauses.

Example:

SELECT * FROM employees WHERE manager_id = NULL;
Returns: Empty set (0 rows)

Why: manager_id = NULL evaluates to NULL for every row, even rows where manager_id IS NULL. NULL = NULL is not TRUE!

-- CORRECT
SELECT * FROM employees WHERE manager_id IS NULL;
Returns: Alice and Paul (employees with no manager)

NULL in Arithmetic (Poison!)
SELECT 
    first_name,
    salary,
    salary + 5000 AS salary_with_bonus
FROM employees
WHERE first_name = 'Noah';
Expected output:

first_name	salary	salary_with_bonus
Noah	NULL	NULL
NULL + 5000 = NULL! Any arithmetic operation with NULL produces NULL.

This is called the "NULL poison" effect — NULL spreads through calculations.

NULL in Aggregates
SELECT 
    COUNT(*) AS total_employees,
    COUNT(salary) AS employees_with_salary,
    SUM(salary) AS total_payroll,
    AVG(salary) AS avg_salary
FROM employees;
Expected output:

total_employees	employees_with_salary	total_payroll	avg_salary
20	18	1633000.00	90722.22
Key points:

COUNT(*) counts all rows (including NULLs)
COUNT(salary) counts only non-NULL values
SUM and AVG ignore NULL values
Pause and Predict: What does MIN(manager_id) return if some manager_ids are NULL?

Answer

String Functions (UPPER, LOWER)

Case-Insensitive Searching (One Use Case)
Find employees whose name starts with "a", case-insensitive:

SELECT first_name, last_name
FROM employees
WHERE LOWER(first_name) LIKE 'a%';
Expected output:

first_name	last_name
Alice	Johnson
How it works: LOWER() converts "Alice" to "alice", then LIKE 'a%' matches.

Note: In MySQL, LIKE is case-insensitive by default, so this example is actually redundant! But in some databases (PostgreSQL, for example), you'd need this technique.

Normalizing Input for Comparison
Compare user input (which might be any case) to database values:

-- Imagine a user types "engineering" (lowercase)
SELECT * 
FROM departments
WHERE LOWER(department_name) = LOWER('Engineering');
What this does: Converts both sides to lowercase, so "Engineering", "engineering", "ENGINEERING" all match.

Returns: The Engineering department.

Combining UPPER/LOWER with CONCAT
Format names as "LAST, First":

SELECT 
    CONCAT(UPPER(last_name), ', ', first_name) AS formatted_name
FROM employees
ORDER BY last_name
LIMIT 5;
Expected output:

formatted_name
ANDERSON, Jack
BROWN, David
CLARK, Sam
DAVIS, Eve
GARCIA, Paul
Professional looking output with last names emphasized in caps.

Pause and Predict: What does UPPER(NULL) return?

Answer`,commonMistakes:`DISTINCT

Mistake #1: DISTINCT on One Column When Selecting Multiple
-- WRONG — Can't use DISTINCT on just one column
SELECT first_name, DISTINCT last_name
FROM employees;
Error: You have an error in your SQL syntax

Why it fails: DISTINCT applies to the entire SELECT list, not individual columns.

-- CORRECT — DISTINCT applies to both columns
SELECT DISTINCT first_name, last_name
FROM employees;
Or use GROUP BY if you want distinct last names with some first name:

SELECT last_name, MIN(first_name) AS first_name
FROM employees
GROUP BY last_name;
Mistake #2: DISTINCT Doesn't Aggregate
-- WRONG — This doesn't give you a count of unique departments
SELECT DISTINCT COUNT(department_id)
FROM employees;
What this does: Counts all department_ids, then applies DISTINCT to that single count value (which does nothing useful).

Expected: 20 (or 18 if you use COUNT(department_id) which excludes NULLs)

What you probably wanted: Count of unique departments:

-- CORRECT — Count distinct departments
SELECT COUNT(DISTINCT department_id) AS unique_departments
FROM employees;
Expected output:

unique_departments
10
(10 unique non-NULL department_ids)

Mistake #3: Performance with DISTINCT on Large Tables
-- CAN BE SLOW on large tables
SELECT DISTINCT *
FROM huge_table;
Why it's slow: MySQL must compare every row to every other row to eliminate duplicates. On a table with millions of rows, this can take time.

Better alternatives:

If possible, ensure uniqueness at INSERT time (don't insert duplicates)
Use GROUP BY with specific columns
Add indexes on columns you're checking for uniqueness
In our small company_db, this isn't an issue. But on production databases with millions of rows, use DISTINCT carefully.

NULL Handling (IS NULL / IS NOT NULL)

Mistake #1: Using = NULL or != NULL
-- WRONG — Never matches anything!
SELECT * FROM employees WHERE salary = NULL;
SELECT * FROM employees WHERE salary != NULL;
Both return empty sets! Comparisons with NULL always evaluate to NULL (treated as FALSE).

-- CORRECT
SELECT * FROM employees WHERE salary IS NULL;
SELECT * FROM employees WHERE salary IS NOT NULL;
Mistake #2: Forgetting NULL in NOT IN
--  TRICKY — Doesn't work as expected if the subquery contains NULL
SELECT *
FROM employees
WHERE department_id NOT IN (1, 2, NULL);
Expected: Employees not in departments 1 or 2

What happens: Returns empty set!

Why: department_id NOT IN (1, 2, NULL) is equivalent to:

department_id != 1 AND department_id != 2 AND department_id != NULL
The last condition (!= NULL) is always FALSE/NULL
So the entire AND condition fails
The fix:

-- CORRECT — Filter out NULLs
SELECT *
FROM employees
WHERE department_id NOT IN (1, 2) AND department_id IS NOT NULL;
Or use NOT EXISTS:

SELECT *
FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM (SELECT 1 AS id UNION SELECT 2 UNION SELECT NULL) vals 
    WHERE vals.id = e.department_id
);
Mistake #3: NULL in CONCAT (String Concatenation)
SELECT CONCAT(first_name, ' ', last_name, ' - Dept: ', department_id)
FROM employees
WHERE first_name = 'Paul';
Expected: "Paul Garcia - Dept: NULL"

What you get: NULL (entire result is NULL)

Why: CONCAT with any NULL argument returns NULL.

The fix: Use COALESCE or IFNULL (we'll cover COALESCE in Part 2):

SELECT CONCAT(first_name, ' ', last_name, ' - Dept: ', IFNULL(department_id, 'None'))
FROM employees
WHERE first_name = 'Paul';
Output: "Paul Garcia - Dept: None"

String Functions (UPPER, LOWER)

Mistake #1: Thinking UPPER/LOWER Changes the Database
SELECT UPPER(first_name) FROM employees;
What beginners think: "This changes all first names to uppercase in the database."

What actually happens: The query DISPLAYS names in uppercase, but the database is unchanged.

To actually change the database:

UPDATE employees
SET first_name = UPPER(first_name);
This permanently changes the data. Be very careful!

Mistake #2: Using UPPER/LOWER in WHERE Unnecessarily (Performance Issue)
--  SLOWER on large tables
SELECT * FROM employees
WHERE UPPER(first_name) = 'ALICE';
Why it's slower: MySQL must convert every first_name to uppercase before comparing. On large tables, this prevents index usage.

Better:

-- • FASTER (MySQL LIKE is case-insensitive by default)
SELECT * FROM employees
WHERE first_name = 'Alice';
When UPPER/LOWER is needed: When you genuinely need case normalization, or when working with databases where comparisons are case-sensitive.

Mistake #3: Forgetting Mixed Case Exists
--  INCOMPLETE
SELECT * FROM employees
WHERE first_name = 'alice' OR first_name = 'ALICE';
What about: 'Alice', 'ALice', 'AlIcE', etc.?

Better:

-- CORRECT
SELECT * FROM employees
WHERE LOWER(first_name) = 'alice';
This catches all case variations with one comparison.`,edgeCaseSpotlight:`DISTINCT

COUNT(DISTINCT column) — Powerful Combination
Count unique values in one query:

SELECT 
    COUNT(*) AS total_employees,
    COUNT(DISTINCT department_id) AS unique_departments,
    COUNT(DISTINCT location) AS unique_locations
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
Expected output:

total_employees	unique_departments	unique_locations
20	10	7
Powerful! Multiple distinct counts in one query.

Note: COUNT(DISTINCT ...) ignores NULL. If you want to count NULL as a distinct value, you need a more complex query.

NULL Handling (IS NULL / IS NOT NULL)

ORDER BY with NULLs
SELECT first_name, salary
FROM employees
ORDER BY salary ASC;
MySQL sorts NULL values first in ASC order (treated as "lowest" values).

Output (top rows):

first_name	salary
Noah	NULL
Paul	NULL
Ivy	55000.00
...	...
In DESC order:

SELECT first_name, salary
FROM employees
ORDER BY salary DESC;
NULLs appear last (still treated as "lowest").

To control NULL positioning:

-- Put NULLs last even in ASC
SELECT first_name, salary
FROM employees
ORDER BY salary IS NULL, salary ASC;
How this works: salary IS NULL evaluates to 0 (false) or 1 (true). Sorts FALSE (0) first, so non-NULLs appear first.

String Functions (UPPER, LOWER)

Non-ASCII Characters
UPPER() and LOWER() work with international characters:

SELECT 
    'café' AS original,
    UPPER('café') AS upper_case,
    LOWER('CAFÉ') AS lower_case;
Expected output:

original	upper_case	lower_case
café	CAFÉ	café
The é is handled correctly! MySQL's character set (utf8mb4) supports international characters.

But be aware: Some special characters (like German ß) have unique uppercase rules. MySQL handles most cases correctly, but edge cases exist.`,tryThis:`DISTINCT

Exercise 1 (Guided)
Find all unique manager IDs (people who manage others). Show only the manager_id column.

Hint
Exercise 2 (Independent)
Find all unique combinations of location and department_name from the departments table. Sort by location.

Exercise 3 (Challenge)
Count how many unique roles exist in the employee_projects table. (Hint: Use COUNT(DISTINCT ...))

NULL Handling (IS NULL / IS NOT NULL)

Exercise 1 (Guided)
Find all employees who don't have a manager assigned. Show their first_name, last_name, and manager_id.

Hint
Exercise 2 (Independent)
Count how many employees have a manager vs. how many don't. Show both counts in one query.

Hint
Exercise 3 (Challenge)
Find employees whose salary is unknown (NULL) or less than $60,000. Show their name and salary, sorted by salary (with NULLs last).

String Functions (UPPER, LOWER)

Exercise 1 (Guided)
Display all department names in lowercase, sorted alphabetically.

Hint
Exercise 2 (Independent)
Find all employees whose last name contains the letter "A" or "a" (case-insensitive). Show their full name.

Hint
Exercise 3 (Challenge)
Create a formatted email address for each employee: firstname.lastname@company.com, all lowercase. Show first_name, last_name, and the generated email.

Hint`,answerKey:`DISTINCT

Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer

NULL Handling (IS NULL / IS NOT NULL)

Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer

String Functions (UPPER, LOWER)

Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`DISTINCT

• DISTINCT eliminates duplicate rows from results
• Applies to the entire SELECT list (all columns together)
• Cannot apply DISTINCT to just one column when selecting multiple
• DISTINCT vs GROUP BY: use DISTINCT for simple deduplication, GROUP BY when you need aggregates
• COUNT(DISTINCT column) counts unique values
• Can impact performance on large tables

NULL Handling (IS NULL / IS NOT NULL)

• NULL represents unknown/missing data — not zero, not empty string
• Use IS NULL and IS NOT NULL — never = NULL or != NULL
• NULL in comparisons always evaluates to NULL (treated as FALSE)
• NULL in arithmetic makes the entire result NULL ("NULL poison")
• Aggregates (SUM, AVG, MIN, MAX) ignore NULL values
• COUNT(*) includes NULLs, COUNT(column) excludes them
• Be careful with NOT IN when the list contains NULL

String Functions (UPPER, LOWER)

• UPPER() converts text to uppercase
• LOWER() converts text to lowercase
• These functions don't change the database — only the display
• Useful for case-insensitive comparisons and data normalization
• Work with international characters (utf8mb4)
• Return NULL if input is NULL
• Be cautious about performance on large tables (indexed columns)

Part 1 Complete!
Congratulations! You've finished all 20 topics in Part 1 — Foundations. You can now:

Insert, update, delete data
Create, alter, drop tables
Query with SELECT, WHERE, ORDER BY, LIMIT
Use aggregate functions and GROUP BY
Understand primary and foreign keys
Join tables (INNER, LEFT, RIGHT)
Handle NULLs and duplicates
Manipulate strings
You have a solid SQL foundation!`,upNext:`DISTINCT

Time for a Challenge! → Mini Challenge 6

You've mastered LEFT JOIN, RIGHT JOIN, and DISTINCT! Practice these join techniques with a challenge.

You can now eliminate duplicates. Next, you'll master the tricky world of NULL values — what they mean and how to handle them properly!

NULL Handling (IS NULL / IS NOT NULL)

Next topic: String Functions (UPPER, LOWER) → part1_20_string_functions_upper_lower.md

You've mastered the tricky world of NULL! Next, you'll learn useful string functions to manipulate text data!

String Functions (UPPER, LOWER)

Next topic: SUBSTRING → part2_01_substring.md

Ready for Part 2 — Intermediate techniques? Type 'next' to continue!`}};export{e as default};
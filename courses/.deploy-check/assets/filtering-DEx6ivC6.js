var e={id:`filtering`,status:`full`,sourceTitle:`Filtering Data`,sourceDocuments:[{title:`Filtering Data`,part:1,topicNumber:8,difficulty:`Beginner`,prerequisites:`select-from-where`}],relatedTopicId:null,sections:{whatIsIt:`Filtering refines your WHERE clause with powerful operators that make queries more flexible. Instead of just = and >, you get LIKE (pattern matching), IN (multiple values), BETWEEN (ranges), and NOT (negation). These operators let you ask more sophisticated questions of your data.

Real-world analogy: Instead of asking "Show me employees named exactly Alice", you can ask "Show me employees whose names start with A" or "Show me employees in departments 1, 2, or 3".`,syntaxBreakdown:`LIKE — Pattern Matching
SELECT columns
FROM table
WHERE column LIKE 'pattern';
Wildcards:

% — Matches any number of characters (including zero)
_ — Matches exactly one character
IN — Multiple Values
SELECT columns
FROM table
WHERE column IN (value1, value2, value3);
BETWEEN — Range of Values
SELECT columns
FROM table
WHERE column BETWEEN low_value AND high_value;
NOT — Negation
SELECT columns
FROM table
WHERE column NOT IN (value1, value2);`,basicExample:`LIKE for Pattern Matching
Find all employees whose first name starts with "A":

SELECT first_name, last_name
FROM employees
WHERE first_name LIKE 'A%';
Expected output:

first_name	last_name
Alice	Johnson
Explanation: 'A%' means "starts with A, followed by anything".

Find employees whose last name ends in "son":

SELECT first_name, last_name
FROM employees
WHERE last_name LIKE '%son';
Expected output:

first_name	last_name
Alice	Johnson
Jack	Anderson
IN for Multiple Values
Find employees in Engineering, Marketing, or Sales:

SELECT first_name, last_name, department_id
FROM employees
WHERE department_id IN (1, 2, 3);
What this does:

Returns rows where department_id is 1, 2, OR 3
Much cleaner than department_id = 1 OR department_id = 2 OR department_id = 3
Expected output: 11 employees across those three departments.

BETWEEN for Ranges
Find employees with salaries between $70,000 and $90,000:

SELECT first_name, last_name, salary
FROM employees
WHERE salary BETWEEN 70000 AND 90000;
What this does:

Returns rows where salary >= 70000 AND salary <= 90000
Note: BETWEEN is inclusive (includes both endpoints)
Expected output:

first_name	last_name	salary
Carol	Williams	78000.00
David	Brown	72000.00
Eve	Davis	85000.00
Leo	Jackson	88000.00`,goingDeeper:`LIKE with _ (Single Character Wildcard)
Find employees whose first name is exactly 3 letters long:

SELECT first_name, last_name
FROM employees
WHERE first_name LIKE '___';
Explanation: Three underscores = exactly 3 characters.

Expected output:

first_name	last_name
Bob	Smith
Eve	Davis
Ivy	Taylor
Leo	Jackson
Mia	White
Sam	Clark
LIKE with Pattern in the Middle
Find employees whose last name contains "ar":

SELECT first_name, last_name
FROM employees
WHERE last_name LIKE '%ar%';
Expected output:

first_name	last_name
Eve	Davis
Paul	Garcia
NOT IN — Exclude Multiple Values
Find employees NOT in Engineering or Marketing:

SELECT first_name, last_name, department_id
FROM employees
WHERE department_id NOT IN (1, 2);
Expected output: All employees except those in departments 1 and 2.

NOT LIKE — Pattern Exclusion
Find employees whose last name does NOT start with "M":

SELECT first_name, last_name
FROM employees
WHERE last_name NOT LIKE 'M%';
Pause and Predict: How many employees will this return?

Answer
BETWEEN with Dates
Find employees hired in 2021:

SELECT first_name, last_name, hire_date
FROM employees
WHERE hire_date BETWEEN '2021-01-01' AND '2021-12-31';
Expected output:

first_name	last_name	hire_date
Carol	Williams	2021-01-10
David	Brown	2021-05-20
Leo	Jackson	2021-10-05
Quinn	Martinez	2021-07-07`,commonMistakes:`Mistake #1: Forgetting % in LIKE Patterns
-- WRONG — Looks for exact match "son" (no wildcards)
SELECT * FROM employees WHERE last_name LIKE 'son';
Returns: Empty set (no one is named exactly "son")

-- CORRECT — Looks for names ending in "son"
SELECT * FROM employees WHERE last_name LIKE '%son';
Remember: LIKE without wildcards is just an exact match (same as =). Use % or _ to make it a pattern.

Mistake #2: LIKE is Case-Insensitive by Default (in MySQL)
-- Both of these return the same results
SELECT * FROM employees WHERE first_name LIKE 'a%';
SELECT * FROM employees WHERE first_name LIKE 'A%';
Both return: Alice

Why: MySQL's default collation is case-insensitive for LIKE. This can surprise people coming from other databases.

If you need case-sensitive matching:

SELECT * FROM employees WHERE first_name LIKE BINARY 'A%';
Mistake #3: Wildcard % Matching NULL
SELECT * FROM employees WHERE manager_id LIKE '%';
What you might think: "This matches everything, including NULL"

What actually happens: Returns employees with non-NULL manager_id only. % doesn't match NULL.

The fix: To include NULL:

SELECT * FROM employees WHERE manager_id LIKE '%' OR manager_id IS NULL;
Mistake #4: BETWEEN with Wrong Order
-- WRONG — Returns nothing!
SELECT * FROM employees WHERE salary BETWEEN 90000 AND 70000;
Why it fails: BETWEEN requires the lower value first, higher value second. This is asking for salary >= 90000 AND salary <= 70000, which is impossible.

-- CORRECT
SELECT * FROM employees WHERE salary BETWEEN 70000 AND 90000;`,edgeCaseSpotlight:`Escaping Special Characters in LIKE
What if you need to search for an actual % or _ character, not as wildcards?

-- Let's say we have a column with discount codes like "SAVE_10" or "SALE%"
SELECT * FROM promotions WHERE code LIKE '%\\_%';  -- Find codes containing an underscore
SELECT * FROM promotions WHERE code LIKE '%\\%%';  -- Find codes containing a percent sign
The backslash \\ escapes the special character, making it literal.

In our company_db: We don't have data like this, but it's important to know for real-world scenarios where column values might contain these characters.`,tryThis:`Exercise 1 (Guided)
Find all employees whose last name starts with "M" or "W". Show their full name.

Hint
Exercise 2 (Independent)
Find all projects with budgets between $100,000 and $200,000 (inclusive). Show the project name and budget.

Exercise 3 (Challenge)
Find all employees hired in 2022 or 2023 whose salary is NOT in the range $60,000-$80,000. Show their name, hire date, and salary.

Hint for Exercise 3`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• LIKE finds patterns using % (any characters) and _ (one character)
• IN checks if a value matches any in a list
• BETWEEN checks if a value is in a range (inclusive)
• NOT negates conditions (NOT IN, NOT LIKE, NOT BETWEEN)
• BETWEEN requires lower value first, higher value second
• LIKE doesn't match NULL — handle NULLs explicitly`,upNext:`Next topic: ORDER BY → part1_09_order_by.md`}};export{e as default};
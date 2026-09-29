var e={id:`mini-challenge-01`,title:`Mini Challenge 1 — Topics 1-4`,part:1,difficulty:`Beginner`,prerequisites:`create-table, insert, update, delete`,content:`Mini Challenge 1 — CREATE TABLE, INSERT, UPDATE, DELETE\r
Overview\r
You've learned the fundamental database operations: creating tables (CREATE TABLE), adding data (INSERT), modifying data (UPDATE), and removing data (DELETE). Now let's combine them in realistic scenarios that test your understanding.\r
\r
Rules:\r
\r
Work in the company_db database\r
Test each query and verify your results\r
If you make a mistake, you can always re-run the setup script from 00_setup_company_db.md\r
Challenge 1: Build a Customer Table\r
Create a table called customers with:\r
\r
customer_id (primary key, auto-increment)\r
full_name (required, up to 100 characters)\r
email (required, unique, up to 100 characters)\r
phone (optional, up to 15 characters)\r
signup_date (date, defaults to current date)\r
is_active (boolean, defaults to TRUE)\r
Hint\r
Use appropriate data types: INT for ID, VARCHAR for text, DATE for dates, BOOLEAN for true/false. Remember NOT NULL, UNIQUE, DEFAULT, and AUTO_INCREMENT.\r
\r
Challenge 2: New Hire Complete\r
Scenario: A new employee named Maya Patel just joined as a Data Scientist (department 10), starting today, with a salary of $96,000. Her manager is Olivia Martin (employee_id = 15). She's been assigned to the "AI Chatbot" project (project_id = 6) as a "Machine Learning Engineer".\r
\r
Your Tasks:\r
\r
Add Maya to the employees table\r
Add her project assignment to employee_projects\r
Verify she appears in both tables with the correct data\r
Hint 1\r
This requires two INSERT statements — one for employees, one for employee_projects. Remember: employee_id is AUTO_INCREMENT, so don't specify it. But you'll need to know what her new employee_id is for the second INSERT. Run a SELECT to find it after the first INSERT.\r
\r
Hint 2\r
-- After inserting Maya, find her employee_id:\r
SELECT employee_id FROM employees WHERE first_name = 'Maya' AND last_name = 'Patel';\r
Challenge 3: Department Reorganization\r
Scenario: The company is restructuring. All employees in Customer Support (department_id = 6) are being moved to Operations (department_id = 9). Additionally, everyone in Operations (including the transferred employees) gets a 3% raise.\r
\r
Your Tasks:\r
\r
Move all Customer Support employees to Operations\r
Give all Operations employees a 3% raise\r
Verify the changes with SELECT statements\r
Hint\r
Two UPDATE statements. First, change department_id for dept 6 employees. Second, increase salary by multiplying by 1.03 for dept 9 employees (which now includes the transferred folks).\r
\r
Challenge 4: Project Cleanup\r
Scenario: All projects that ended before January 1, 2022 are being archived. This means:\r
\r
Remove all employee assignments from those projects\r
Delete the projects themselves from the projects table\r
Your Tasks:\r
\r
Identify which projects ended before 2022-01-01\r
Delete employee assignments for those projects\r
Delete the projects themselves\r
Verify the deletions\r
Hint 1\r
First, find the project_ids:\r
\r
SELECT project_id, project_name, end_date \r
FROM projects \r
WHERE end_date < '2022-01-01';\r
Hint 2\r
You must delete from employee_projects FIRST (child table), then from projects (parent table). Why? Foreign key constraints.\r
\r
Challenge 5: Correction Required\r
Scenario: You discover a data entry error. Employee "Sam Clark" (employee_id = 19) was entered with the wrong last name. His actual last name is "Clarke" (with an "e"). Also, his hire date was entered incorrectly — he was actually hired on September 26, 2022 (not the 25th).\r
\r
Your Task:\r
\r
Correct both errors with a single UPDATE statement\r
Verify the correction\r
Challenge 6: Volunteer Cleanup\r
Scenario: Employee Paul Garcia (employee_id = 16) was actually a volunteer, not a permanent employee. He's no longer with the company. Remove all traces of him from the database (both his employee record and any project assignments).\r
\r
Your Tasks:\r
\r
Remove his project assignments first\r
Then remove his employee record\r
Verify he's completely gone\r
Hint\r
Order matters! Delete from employee_projects first (child), then from employees (parent). If you try to delete from employees first, MySQL will block you due to foreign key constraints in employee_projects.\r
\r
Answer Key\r
Challenge 1 Answer\r
CREATE TABLE customers (\r
    customer_id INT PRIMARY KEY AUTO_INCREMENT,\r
    full_name VARCHAR(100) NOT NULL,\r
    email VARCHAR(100) NOT NULL UNIQUE,\r
    phone VARCHAR(15),\r
    signup_date DATE DEFAULT (CURRENT_DATE),\r
    is_active BOOLEAN DEFAULT TRUE\r
);\r
Verify:\r
\r
DESCRIBE customers;\r
Challenge 2 Answer\r
-- Step 1: Add Maya to employees\r
INSERT INTO employees (first_name, last_name, department_id, salary, hire_date, manager_id)\r
VALUES ('Maya', 'Patel', 10, 96000.00, '2026-04-29', 15);\r
\r
-- Step 2: Find her employee_id (it will be 21 or the next available)\r
SELECT employee_id, first_name, last_name FROM employees \r
WHERE first_name = 'Maya' AND last_name = 'Patel';\r
\r
-- Step 3: Add her project assignment (assuming her employee_id is 21)\r
INSERT INTO employee_projects (employee_id, project_id, role)\r
VALUES (21, 6, 'Machine Learning Engineer');\r
\r
-- Step 4: Verify\r
SELECT e.first_name, e.last_name, e.salary, e.department_id, \r
       p.project_name, ep.role\r
FROM employees e\r
JOIN employee_projects ep ON e.employee_id = ep.employee_id\r
JOIN projects p ON ep.project_id = p.project_id\r
WHERE e.first_name = 'Maya' AND e.last_name = 'Patel';\r
Challenge 3 Answer\r
-- Step 1: Move Customer Support employees to Operations\r
UPDATE employees\r
SET department_id = 9\r
WHERE department_id = 6;\r
\r
-- Step 2: Give all Operations employees a 3% raise\r
UPDATE employees\r
SET salary = salary * 1.03\r
WHERE department_id = 9;\r
\r
-- Step 3: Verify\r
SELECT employee_id, first_name, last_name, department_id, salary\r
FROM employees\r
WHERE department_id = 9\r
ORDER BY salary DESC;\r
Expected: Ivy, Tina, and any others who were in dept 6 now show dept 9, and all have increased salaries.\r
\r
Challenge 4 Answer\r
-- Step 1: Identify old projects\r
SELECT project_id, project_name, end_date\r
FROM projects\r
WHERE end_date < '2022-01-01';\r
\r
-- Projects 10 (Cloud Infrastructure, ended 2021-06-01) matches\r
\r
-- Step 2: Delete employee assignments for those projects\r
DELETE FROM employee_projects\r
WHERE project_id IN (\r
    SELECT project_id FROM projects WHERE end_date < '2022-01-01'\r
);\r
\r
-- Step 3: Delete the projects themselves\r
DELETE FROM projects\r
WHERE end_date < '2022-01-01';\r
\r
-- Step 4: Verify\r
SELECT * FROM projects WHERE project_id = 10;  -- Should be empty\r
Challenge 5 Answer\r
-- Correct both errors in one UPDATE\r
UPDATE employees\r
SET last_name = 'Clarke', hire_date = '2022-09-26'\r
WHERE employee_id = 19;\r
\r
-- Verify\r
SELECT employee_id, first_name, last_name, hire_date\r
FROM employees\r
WHERE employee_id = 19;\r
Expected: Sam Clarke (with an "e") and hire_date of 2022-09-26.\r
\r
Challenge 6 Answer\r
-- Step 1: Delete project assignments first (child table)\r
DELETE FROM employee_projects\r
WHERE employee_id = 16;\r
\r
-- Step 2: Delete employee record (parent table)\r
DELETE FROM employees\r
WHERE employee_id = 16;\r
\r
-- Step 3: Verify he's gone\r
SELECT * FROM employees WHERE employee_id = 16;  -- Empty set\r
SELECT * FROM employee_projects WHERE employee_id = 16;  -- Empty set\r
How Did You Do?\r
6/6 correct: You're crushing the basics!\r
4-5 correct: • Solid understanding, review the tricky parts\r
2-3 correct: Review CREATE TABLE, INSERT, UPDATE, DELETE\r
0-1 correct: Re-run the setup script and practice each topic again\r
Key Takeaways\r
• CREATE TABLE defines structure before adding data • Always consider foreign key relationships — delete children before parents\r
• UPDATE and DELETE without WHERE affect ALL rows — be careful!\r
• Use SELECT to verify your changes after every modification\r
• Multiple operations often need specific order (like deleting Paul's assignments before deleting Paul)\r
\r
Up Next\r
Continue to: ALTER TABLE → part1_05_alter_table.md`};export{e as default};
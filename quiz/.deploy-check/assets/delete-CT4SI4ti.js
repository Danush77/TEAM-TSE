var e={id:`delete`,status:`full`,sourceTitle:`DELETE`,sourceDocuments:[{title:`DELETE`,part:1,topicNumber:4,difficulty:`Beginner`,prerequisites:`insert, update`}],relatedTopicId:null,sections:{whatIsIt:`DELETE removes entire rows from a table. Unlike UPDATE (which changes values), DELETE removes the row completely. Think of it like removing an entire row from a spreadsheet — once it's gone, all data in that row is gone.

Real-world analogy: An employee leaves the company. If you don't need to keep their records, you DELETE their row from the employees table.`,syntaxBreakdown:`DELETE FROM table_name
WHERE condition;
Breaking it down:

DELETE FROM — The command that says "I'm removing rows"
table_name — Which table you're removing from
WHERE — CRITICAL: Specifies which rows to delete (without it, ALL rows get deleted!)
Notice what's missing: There's no column list. DELETE removes the entire row, not individual column values.`,basicExample:`Let's remove the test employee we added in Exercise 2 of the INSERT topic (Zara Chen, employee_id = 21).

DELETE FROM employees
WHERE employee_id = 21;
What this does:

Finds the employee with ID 21
Removes that entire row from the table
All columns (first_name, last_name, salary, etc.) are gone
Expected output:

Query OK, 1 row affected
Verify it's gone:

SELECT * FROM employees WHERE employee_id = 21;
Expected result: Empty set (0 rows) — the employee no longer exists.`,goingDeeper:`Deleting Multiple Rows
Just like UPDATE, you can delete many rows at once:

DELETE FROM projects
WHERE budget IS NULL;
What this does:

Finds all projects where budget is NULL
Deletes all of them
In our sample data, this removes "Employee Training Portal" (project_id = 11)
Expected output:

Query OK, 1 row affected
Deleting with Complex Conditions
You can use any valid WHERE condition, including multiple criteria:

DELETE FROM employees
WHERE salary < 60000.00 AND hire_date > '2023-01-01';
What this does:

Finds employees with salary under $60,000 AND hired after January 1, 2023
Removes those rows
Pause and Predict: Looking at our employee data, how many employees match this condition?

Answer`,commonMistakes:`Mistake #1: Forgetting WHERE (CATASTROPHIC!)
-- WRONG — THIS DELETES EVERY EMPLOYEE!
DELETE FROM employees;
Why it's catastrophic: Without WHERE, this removes EVERY row in the table. Your entire employee database is gone. The table structure remains, but it's empty.

Expected output:

Query OK, 20 rows affected  -- Everything is gone!
This is the nuclear option. You almost never want this.

-- CORRECT
DELETE FROM employees
WHERE employee_id = 16;  -- Only deletes Paul
Best practice: Just like UPDATE, always write your WHERE clause first and test it with SELECT before running DELETE.

Mistake #2: Confusing DELETE with UPDATE
-- WRONG — This tries to delete a salary, not an employee
DELETE FROM employees
WHERE salary = 68000.00;
What beginners think this does: "Delete the salary from Paul's record."

What it actually does: Deletes the ENTIRE row for any employee with a salary of $68,000.

The fix: If you want to remove just a salary value (set it to NULL), use UPDATE:

-- CORRECT
UPDATE employees
SET salary = NULL
WHERE employee_id = 16;
Remember: DELETE removes entire rows. UPDATE changes column values.

Mistake #3: Foreign Key Constraints Block Deletion
--  MIGHT FAIL
DELETE FROM departments
WHERE department_id = 1;
Why it might fail: Department 1 (Engineering) has employees assigned to it (Bob, Alice, Jack, Leo, Quinn, and others). The employees table has a foreign key constraint pointing to departments.

Error message: Cannot delete or update a parent row: a foreign key constraint fails

What this means: MySQL prevents you from deleting a department that still has employees, because that would leave employees pointing to a non-existent department.

Solutions:

First reassign or delete the employees
Or set the foreign key to CASCADE (advanced topic for later)
-- CORRECT approach
-- First, reassign employees to another department or set to NULL
UPDATE employees
SET department_id = NULL
WHERE department_id = 1;

-- Now you can delete the department
DELETE FROM departments
WHERE department_id = 1;`,edgeCaseSpotlight:`DELETE with Subqueries
You can use a subquery in your WHERE clause to delete based on data from another table:

DELETE FROM employee_projects
WHERE project_id IN (
    SELECT project_id 
    FROM projects 
    WHERE end_date < '2022-01-01'
);
What this does:

The subquery finds all projects that ended before 2022
DELETE removes all employee assignments to those old projects
The projects themselves remain; we're just removing the assignments
Why this matters: You can delete rows based on relationships to other tables without needing to know the specific IDs.`,tryThis:`Exercise 1 (Guided)
Delete all departments that have NULL in the location column.

Hint
Exercise 2 (Independent)
Delete all employee assignments from the employee_projects table where the role is NULL.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer`,quickRecap:`• DELETE removes entire rows from a table
• Always use WHERE unless you want to delete everything (rare!)
• Test your WHERE clause with SELECT before running DELETE
• Foreign key constraints can prevent deletion if related data exists
• DELETE removes the row; UPDATE sets values to NULL`,upNext:`Time for a Challenge! → Mini Challenge 1`}};export{e as default};
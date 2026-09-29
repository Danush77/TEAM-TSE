var e={id:`alter-table`,status:`full`,sourceTitle:`ALTER TABLE`,sourceDocuments:[{title:`ALTER TABLE`,part:1,topicNumber:5,difficulty:`Beginner`,prerequisites:`create-table`}],relatedTopicId:null,sections:{whatIsIt:`ALTER TABLE modifies an existing table's structure. You use it to add columns, remove columns, change data types, rename columns, and modify constraints — all without recreating the table or losing existing data.

Real-world analogy: Your filing cabinet needs a new drawer for a new document type. ALTER TABLE adds that drawer without emptying the existing ones.`,syntaxBreakdown:`ALTER TABLE table_name
action;
Common actions:

ADD COLUMN column_name data_type — Add a new column
DROP COLUMN column_name — Remove a column
MODIFY COLUMN column_name new_data_type — Change a column's data type
CHANGE COLUMN old_name new_name data_type — Rename and/or redefine a column
ADD PRIMARY KEY (column_name) — Add a primary key constraint
ADD FOREIGN KEY (column_name) REFERENCES other_table(column) — Add a foreign key`,basicExample:`Let's add a column to track phone numbers in the employees table:

ALTER TABLE employees
ADD COLUMN phone_number VARCHAR(15);
What this does:

Adds a new column called phone_number to the employees table
The column accepts text up to 15 characters
All existing rows get NULL in this new column (since we didn't specify a default)
Expected output:

Query OK, 0 rows affected
Verify it worked:

DESCRIBE employees;
You should see phone_number in the column list.

Now you can update employees with their phone numbers:

UPDATE employees
SET phone_number = '555-0123'
WHERE employee_id = 1;`,goingDeeper:`Adding Multiple Columns at Once
ALTER TABLE employees
ADD COLUMN email VARCHAR(100),
ADD COLUMN emergency_contact VARCHAR(100);
What this does:

Adds both email and emergency_contact columns in one command
More efficient than two separate ALTER TABLE statements
Dropping a Column
ALTER TABLE employees
DROP COLUMN emergency_contact;
What this does:

Completely removes the emergency_contact column
WARNING: All data in that column is permanently deleted!
Expected output:

Query OK, 0 rows affected
Modifying a Column's Data Type
ALTER TABLE employees
MODIFY COLUMN phone_number VARCHAR(20);
What this does:

Changes phone_number from VARCHAR(15) to VARCHAR(20)
Useful if you realize 15 characters isn't enough for international numbers
Important: You can't always change data types freely. Converting VARCHAR to INT will fail if the column contains text that isn't a number.

Renaming a Column
ALTER TABLE employees
CHANGE COLUMN phone_number phone VARCHAR(20);
What this does:

Renames phone_number to just phone
Also requires you to re-specify the data type (VARCHAR(20))
Pause and Predict: What happens to the data in the column when you rename it?

Answer
Adding a Default Value to an Existing Column
ALTER TABLE office_supplies
MODIFY COLUMN quantity INT DEFAULT 0 NOT NULL;
What this does:

Updates the quantity column to have a default value of 0
Also adds NOT NULL constraint
Existing rows are NOT affected — only new rows will use the default`,commonMistakes:`Mistake #1: Dropping a Column with Data (Irreversible!)
--  DANGEROUS
ALTER TABLE employees
DROP COLUMN salary;
Why it's dangerous: This permanently deletes all salary data. Once you run this, there's no undo button. The data is gone forever.

Best practice: Before dropping a column, export or back up the data:

-- CORRECT approach
-- First, check what data exists
SELECT employee_id, salary FROM employees;

-- Optionally back it up to another table
CREATE TABLE salary_backup AS
SELECT employee_id, salary FROM employees;

-- NOW you can drop it safely
ALTER TABLE employees
DROP COLUMN salary;
Mistake #2: Changing Data Type Without Checking Compatibility
-- WRONG
ALTER TABLE employees
MODIFY COLUMN salary INT;  -- Converting DECIMAL(10,2) to INT
Why it's problematic:

If Alice's salary is $120,000.00, converting to INT makes it 120000 — losing the decimal precision
If any salary has cents (like $87,500.50), those cents are lost forever
INT can't represent decimals, so all fractional parts are truncated
The fix: Only change data types when you're certain it won't cause data loss.

Mistake #3: Adding NOT NULL to a Column with Existing NULLs
--  WILL FAIL
ALTER TABLE employees
MODIFY COLUMN salary DECIMAL(10,2) NOT NULL;
Why it fails: Employee #14 (Noah) and #16 (Paul) have NULL salaries. You can't add a NOT NULL constraint when NULL values already exist.

Error message: Invalid use of NULL value

The fix: First, update the NULL values:

-- CORRECT
-- First, replace NULLs with a default value
UPDATE employees
SET salary = 50000.00
WHERE salary IS NULL;

-- Now you can add NOT NULL
ALTER TABLE employees
MODIFY COLUMN salary DECIMAL(10,2) NOT NULL;`,edgeCaseSpotlight:`Adding AUTO_INCREMENT to an Existing Column
You might have a table where you forgot to make the ID column AUTO_INCREMENT:

CREATE TABLE tasks (
    task_id INT PRIMARY KEY,
    task_description TEXT
);
You can add AUTO_INCREMENT later:

ALTER TABLE tasks
MODIFY COLUMN task_id INT AUTO_INCREMENT;
But beware: This only works if:

The column is already a PRIMARY KEY or UNIQUE KEY
All existing values are unique integers
Why this matters: You can fix design mistakes without recreating the entire table.`,tryThis:`Exercise 1 (Guided)
Add a column called budget_approved (boolean, defaults to FALSE) to the projects table.

Hint
Exercise 2 (Independent)
The departments table needs an employee_count column (integer, defaults to 0). Add it, then write an UPDATE statement to set the correct count for each department based on actual employees.

Hint for UPDATE part`,answerKey:`Exercise 1 Answer
Exercise 2 Answer`,quickRecap:`• ALTER TABLE modifies existing table structures
• You can add, drop, or modify columns without losing data
• Always back up before dropping columns — it's irreversible
• Check data compatibility before changing data types
• Can't add NOT NULL if NULL values already exist`,upNext:`Next topic: DROP TABLE → part1_06_drop_table.md`}};export{e as default};
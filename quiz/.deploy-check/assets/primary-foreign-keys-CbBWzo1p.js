var e={id:`primary-foreign-keys`,status:`full`,sourceTitle:`Primary Key and Foreign Key Concepts`,sourceDocuments:[{title:`Primary Key and Foreign Key Concepts`,part:1,topicNumber:14,difficulty:`Beginner`,prerequisites:`create-table`}],relatedTopicId:null,sections:{whatIsIt:`Primary Keys uniquely identify each row in a table. Foreign Keys create relationships between tables by referencing another table's primary key. Together, they enforce data integrity and enable you to connect related information.

Real-world analogy: A primary key is like a unique employee ID badge. A foreign key is like listing your manager's ID badge number on your record — it connects you to another employee.

Primary Key
What Makes a Good Primary Key?
A primary key must be:

UNIQUE — No two rows can have the same value
NOT NULL — Every row must have a value
UNCHANGING — The value should never change (best practice)
Common approaches:

Auto-incrementing integers (employee_id: 1, 2, 3...)
Unique identifiers (UUID)
Natural keys (Social Security Number, Email) — but these can change, so be careful
Example from company_db
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,  -- Primary key
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    ...
);
What this does:

employee_id is the primary key
AUTO_INCREMENT generates unique values automatically
MySQL ensures no duplicate employee_ids
Cannot insert NULL for employee_id
Foreign Key
What Is a Foreign Key?
A foreign key is a column that references the primary key of another table. It creates a relationship: "This employee works in THIS department."

Example from company_db
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    department_id INT,  -- This is a foreign key
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
What this enforces:

department_id in employees must exist in departments table
Can't assign an employee to department 999 if department 999 doesn't exist
Protects against "orphaned" data`,syntaxBreakdown:``,basicExample:`Let's see how the relationship works:

-- departments table (parent)
SELECT * FROM departments WHERE department_id = 1;
Output:

department_id	department_name	location
1	Engineering	San Francisco
-- employees table (child)
SELECT first_name, last_name, department_id 
FROM employees 
WHERE department_id = 1;
Output:

first_name	last_name	department_id
Alice	Johnson	1
Bob	Smith	1
Jack	Anderson	1
Leo	Jackson	1
Quinn	Martinez	1
The relationship: All five employees reference department 1, which exists in the departments table.`,goingDeeper:`Why Foreign Keys Matter
Without foreign keys:

-- Oops! No constraint
INSERT INTO employees (first_name, last_name, department_id)
VALUES ('Jane', 'Doe', 999);  -- Department 999 doesn't exist!
This succeeds (if no foreign key), but now Jane is assigned to a non-existent department. Your data is broken.

With foreign keys:

-- Foreign key constraint exists
INSERT INTO employees (first_name, last_name, department_id)
VALUES ('Jane', 'Doe', 999);
Error: Cannot add or update a child row: a foreign key constraint fails

MySQL protects you from creating invalid relationships!

Cascade Behavior (Advanced Preview)
When you define a foreign key, you can specify what happens when the referenced row is deleted or updated:

ON DELETE CASCADE — If you delete the parent, delete all children
ON DELETE SET NULL — If you delete the parent, set children's FK to NULL
ON DELETE RESTRICT — Prevent deleting the parent if children exist (default)
Example:

CREATE TABLE employees (
    ...
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE SET NULL  -- If department is deleted, set employee's dept to NULL
);
Pause and Predict: What happens if you try to DELETE a department that has employees, with the default RESTRICT behavior?

Answer
Self-Referencing Foreign Keys
A table can reference itself! In employees, manager_id is a foreign key to employee_id in the same table:

CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    ...
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);
What this means: An employee's manager is also an employee. Alice (employee_id=1) is Bob's manager (Bob has manager_id=1).`,commonMistakes:`Mistake #1: Forgetting to Create the Parent Table First
-- WRONG ORDER
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100)
);
Error: Failed to open the referenced table 'departments'

Why it fails: You're referencing departments before it exists!

-- CORRECT ORDER
CREATE TABLE departments (  -- Parent first
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100)
);

CREATE TABLE employees (  -- Child second
    employee_id INT PRIMARY KEY,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
Mistake #2: Mismatched Data Types
-- WRONG
CREATE TABLE departments (
    department_id INT PRIMARY KEY  -- INT
);

CREATE TABLE employees (
    department_id VARCHAR(10),  -- VARCHAR doesn't match INT!
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
Error: Foreign key and referenced key have different types.

The fix: Data types must match exactly.

Mistake #3: Trying to Insert Invalid Foreign Key Values
INSERT INTO employees (first_name, last_name, department_id)
VALUES ('Test', 'User', 999);  -- Department 999 doesn't exist
Error: Cannot add or update a child row: a foreign key constraint fails

The fix: Only use department_ids that exist in the departments table, or use NULL (if allowed).`,edgeCaseSpotlight:`NULL Foreign Keys
Foreign keys can be NULL (unless you add NOT NULL):

INSERT INTO employees (first_name, last_name, department_id)
VALUES ('Contractor', 'Smith', NULL);  -- No department assigned
This works! NULL means "no relationship" — the contractor isn't assigned to any department yet.

Important: NULL foreign keys bypass the constraint. You can't reference a non-existent department, but you CAN have no department at all.`,tryThis:`Exercise 1 (Guided)
Look at the employee_projects table. Identify:

What are its foreign keys?
Which tables do they reference?
What relationship does this table create?
Hint
Exercise 2 (Independent)
Explain what would happen if you tried to:

DELETE FROM departments WHERE department_id = 1;
Think through the foreign key constraints.

Exercise 3 (Challenge)
Design a new table called tasks with:

task_id (primary key, auto-increment)
task_name (required)
assigned_to (foreign key referencing employees.employee_id)
project_id (foreign key referencing projects.project_id)
Write the full CREATE TABLE statement.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• Primary Key uniquely identifies each row (UNIQUE + NOT NULL)
• Foreign Key creates relationships by referencing another table's primary key
• Foreign keys enforce data integrity (can't reference non-existent rows)
• Create parent table before child table
• Foreign key and referenced key must have matching data types
• Foreign keys can be NULL (meaning "no relationship")
• CASCADE, SET NULL, RESTRICT control deletion behavior`,upNext:`Next topic: INNER JOIN → part1_15_inner_join.md

You understand how tables relate through keys. Next, you'll learn how to QUERY across related tables using JOINs!`}};export{e as default};
var e={id:`create-table`,status:`full`,sourceTitle:`CREATE TABLE`,sourceDocuments:[{title:`CREATE TABLE`,part:1,topicNumber:1,difficulty:`Beginner`,prerequisites:`setup-company-db`}],relatedTopicId:null,sections:{whatIsIt:`CREATE TABLE — Building Your Database Structure
CREATE TABLE defines a new table in your database. It specifies the table's name, the columns it contains, the data type of each column, and any constraints (like "this column can't be NULL" or "this column must be unique").

Real-world analogy: Creating a spreadsheet template with predefined columns — you define the structure before adding data.

Key point: You must CREATE a table before you can INSERT, UPDATE, or DELETE data in it. Structure first, then data.`,syntaxBreakdown:`CREATE TABLE table_name (
    column_name1 data_type constraints,
    column_name2 data_type constraints,
    ...
);
Breaking it down:

CREATE TABLE — The command
table_name — What you want to call your table (use lowercase with underscores: employees, order_items)
column_name — The name of each field
data_type — What kind of data (INT for numbers, VARCHAR for text, DATE for dates, etc.)
constraints — Optional rules (NOT NULL, PRIMARY KEY, etc.)`,basicExample:`Let's create a simple tasks table:

CREATE TABLE tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE
);
What this creates:

A table called tasks
Column task_id: whole number, automatically assigned, unique identifier
Column task_name: text up to 200 characters, required (cannot be NULL)
Column is_completed: true/false value, defaults to FALSE if not specified
Column due_date: date value, optional (can be NULL)
Expected output:

Query OK, 0 rows affected
Verify it exists:

SHOW TABLES;
You'll see tasks in the list.

Inspect its structure:

DESCRIBE tasks;
-- or
DESC tasks;
Expected output:

Field	Type	Null	Key	Default	Extra
task_id	int	NO	PRI	NULL	auto_increment
task_name	varchar(200)	NO		NULL	
is_completed	tinyint(1)	YES		0	
due_date	date	YES		NULL	
Common Data Types
Numeric Types
INT — Whole numbers (-2 billion to +2 billion)
DECIMAL(10,2) — Precise decimal (10 total digits, 2 after decimal) — use for money
FLOAT / DOUBLE — Approximate decimals — use for scientific data
String Types
VARCHAR(n) — Variable-length text up to n characters (most common)
TEXT — Large text blocks (up to 65,535 characters)
CHAR(n) — Fixed-length text (always exactly n characters)
Date/Time Types
DATE — Date only (YYYY-MM-DD)
TIME — Time only (HH:MM:SS)
DATETIME — Date and time combined
TIMESTAMP — Date and time, auto-updates on row modification
Boolean
BOOLEAN — True/False (actually stored as TINYINT: 0 = false, 1 = true)`,goingDeeper:`The employees Table (from company_db)
Let's examine the employees table you've been using:

CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INT,
    salary DECIMAL(10, 2),
    hire_date DATE,
    manager_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);
Key features:

PRIMARY KEY — employee_id uniquely identifies each employee
AUTO_INCREMENT — Database assigns next number automatically (1, 2, 3...)
NOT NULL — first_name and last_name are required
FOREIGN KEY — department_id must match a real department; manager_id must match a real employee
Self-referencing FK — manager_id points back to the same table (for organizational hierarchy)
Creating a Table with Default Values
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
What's new here:

DEFAULT TRUE — If you don't specify in_stock, it's automatically TRUE
DEFAULT CURRENT_TIMESTAMP — Automatically records when the row was created
ON UPDATE CURRENT_TIMESTAMP — Automatically updates timestamp when row is modified
Creating a Table with Constraints
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    age INT CHECK (age >= 18),
    account_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (account_balance >= 0)
);
Constraints explained:

UNIQUE — No two users can have the same username or email
CHECK — Enforces rules (age must be 18+, balance can't be negative)
Pause and Predict: What happens if you try to insert a user with age = 15?

Answer`,commonMistakes:`Mistake #1: Using Spaces or Reserved Words in Table Names
-- ❌ WRONG
CREATE TABLE order details (  -- Space in name!
    ...
);

CREATE TABLE order (  -- 'order' is a reserved word!
    ...
);
Errors: Syntax error or unpredictable behavior.

Fix:

-- ✅ CORRECT
CREATE TABLE order_details (  -- Use underscores
    ...
);

CREATE TABLE orders (  -- Pluralize to avoid reserved word
    ...
);
Best practice: Use lowercase letters, numbers, and underscores only. Avoid SQL reserved words.

Mistake #2: Forgetting to Specify Data Type Length
-- ❌ WRONG
CREATE TABLE customers (
    name VARCHAR,  -- How long can it be?
    ...
);
Error: "You have an error in your SQL syntax"

Fix:

-- ✅ CORRECT
CREATE TABLE customers (
    name VARCHAR(100),  -- Explicitly set max length
    ...
);
Mistake #3: Creating a Table That Already Exists
CREATE TABLE employees (
    ...
);
Error (if table exists): "Table 'employees' already exists"

Fix: Use CREATE TABLE IF NOT EXISTS:

-- ✅ SAFE
CREATE TABLE IF NOT EXISTS employees (
    ...
);
This won't error if the table already exists — it just does nothing.`,edgeCaseSpotlight:`Creating a Table from Another Table
-- Copy structure AND data
CREATE TABLE employees_backup AS
SELECT * FROM employees;

-- Copy structure only (no data)
CREATE TABLE employees_template LIKE employees;
Use case: Backups, testing, or creating similar tables quickly.

Temporary Tables
CREATE TEMPORARY TABLE session_data (
    user_id INT,
    action VARCHAR(50),
    timestamp DATETIME
);
What's different:

Exists only for your current session
Automatically deleted when you disconnect
Not visible to other users
Perfect for intermediate calculations`,tryThis:`Exercise 1 (Guided)
Create a table called meetings with:

meeting_id (INT, primary key, auto-increment)
meeting_title (VARCHAR 150, required)
meeting_date (DATE, required)
room_number (INT, optional)
is_confirmed (BOOLEAN, default FALSE)
Hint
Exercise 2 (Independent)
Create a books table with:

book_id (INT, primary key, auto-increment)
title (VARCHAR 200, required, unique)
author (VARCHAR 100, required)
publication_year (INT)
price (DECIMAL 6,2, must be positive)
available (BOOLEAN, default TRUE)
Hint
Exercise 3 (Challenge)
Create an orders table that references customers and products:

order_id (INT, primary key, auto-increment)
customer_id (INT, foreign key to customers table)
product_id (INT, foreign key to products table)
quantity (INT, must be at least 1)
order_date (DATETIME, auto-set to current timestamp)
You'll need to create customers and products tables first (keep them simple).

Hint`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• CREATE TABLE defines database structure before adding data
• Specify column names, data types, and constraints
• PRIMARY KEY uniquely identifies each row
• AUTO_INCREMENT automatically generates sequential IDs
• NOT NULL makes a column required
• FOREIGN KEY links tables and maintains referential integrity
• DEFAULT provides automatic values
• Use DESCRIBE or DESC to inspect table structure
• CREATE TABLE before you INSERT data`,upNext:`Next topic: INSERT → part1_02_insert.md`}};export{e as default};
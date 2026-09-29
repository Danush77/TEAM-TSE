var e={id:`insert`,status:`full`,sourceTitle:`INSERT`,sourceDocuments:[{title:`INSERT`,part:1,topicNumber:2,difficulty:`Beginner`,prerequisites:`create-table`}],relatedTopicId:null,sections:{whatIsIt:`INSERT is how you add new rows (records) to a table. Think of a table like a spreadsheet — INSERT lets you add a new row of data. You specify which table you're adding to, which columns you're filling in, and what values go in those columns.

Real-world analogy: Hiring a new employee means adding their information to your employee records. That's an INSERT.`,syntaxBreakdown:`INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
Breaking it down:

INSERT INTO — The command that says "I'm adding data"
table_name — Which table you're adding to
(column1, column2, ...) — Which columns you're filling (in order)
VALUES — Keyword that introduces the actual data
(value1, value2, ...) — The actual data values (must match the column order)
Key rule: The number of values must match the number of columns you listed. If you list 3 columns, you must provide 3 values.`,basicExample:`Let's add a new employee to the employees table.

INSERT INTO employees (first_name, last_name, department_id, salary, hire_date, manager_id)
VALUES ('Zara', 'Chen', 1, 87000.00, '2023-05-01', 10);
What this does:

Adds a new employee named Zara Chen
Assigns her to department 1 (Engineering)
Sets her salary at $87,000
Records her hire date as May 1, 2023
Sets her manager as employee_id 10 (Jack Anderson)
Expected output:

Query OK, 1 row affected
To verify it worked:

SELECT * FROM employees WHERE first_name = 'Zara';
employee_id	first_name	last_name	department_id	salary	hire_date	manager_id
21	Zara	Chen	1	87000.00	2023-05-01	10`,goingDeeper:`Inserting Multiple Rows at Once
You don't have to run INSERT once per row. You can add multiple rows in a single statement by listing multiple value sets separated by commas:

INSERT INTO departments (department_name, location)
VALUES 
    ('Research', 'Austin'),
    ('Quality Assurance', 'Remote'),
    ('Business Development', 'Miami');
Expected output:

Query OK, 3 rows affected
This adds three new departments in one command. Much more efficient than three separate INSERTs.

Pause and Predict: How many rows will be in the departments table now? (Hint: There were originally 10.)

Answer
Inserting Without Specifying All Columns
You don't have to provide values for every column. If a column allows NULL or has a default value, you can skip it:

INSERT INTO employees (first_name, last_name, hire_date)
VALUES ('Jordan', 'Lee', '2023-06-15');
What happens here:

first_name, last_name, and hire_date are provided
department_id, salary, and manager_id are not provided, so they become NULL
employee_id is also not provided, but it's AUTO_INCREMENT, so MySQL assigns the next available number automatically`,commonMistakes:`Mistake #1: Mismatched Number of Columns and Values
-- WRONG
INSERT INTO employees (first_name, last_name, salary)
VALUES ('Alex', 'Taylor', 75000.00, 5);  -- 4 values but only 3 columns!
Why it fails: You listed 3 columns but provided 4 values. MySQL doesn't know where to put that extra 5.

Error message: Column count doesn't match value count at row 1

-- CORRECT
INSERT INTO employees (first_name, last_name, salary, department_id)
VALUES ('Alex', 'Taylor', 75000.00, 5);
Mistake #2: Wrong Data Type
-- WRONG
INSERT INTO employees (first_name, last_name, salary)
VALUES ('Morgan', 'Kim', 'sixty thousand');  -- Salary expects a number, not text!
Why it fails: The salary column is defined as DECIMAL (a number type), but you're trying to insert a string.

Error message: Incorrect decimal value: 'sixty thousand' for column 'salary'

-- CORRECT
INSERT INTO employees (first_name, last_name, salary)
VALUES ('Morgan', 'Kim', 60000.00);
Mistake #3: Forgetting Quotes Around Strings
-- WRONG
INSERT INTO employees (first_name, last_name)
VALUES (Riley, Parker);  -- MySQL thinks Riley and Parker are column names!
Why it fails: Without quotes, MySQL interprets Riley and Parker as identifiers (like column names), not as literal text values.

Error message: Unknown column 'Riley' in 'field list'

-- CORRECT
INSERT INTO employees (first_name, last_name)
VALUES ('Riley', 'Parker');
Rule of thumb: Strings and dates need single quotes. Numbers don't.`,edgeCaseSpotlight:`AUTO_INCREMENT Behavior
When you insert a row into a table with an AUTO_INCREMENT column (like employee_id), you should not specify a value for that column. Let MySQL assign it automatically.

What happens if you DO specify it?

INSERT INTO employees (employee_id, first_name, last_name)
VALUES (999, 'Test', 'User');
This works! But now you've "used up" ID 999. The next AUTO_INCREMENT value will be 1000, not 22 (the next sequential number).

Best practice: Never specify AUTO_INCREMENT columns unless you're doing a data migration and need to preserve specific IDs. Let MySQL manage them.`,tryThis:`Exercise 1 (Guided)
Add a new project called "AI Research Initiative" that started on January 1, 2024, has no end date yet, and has a budget of $600,000.

Hint
Exercise 2 (Independent)
Add yourself as an employee! Include your name, pick a department (use a department_id from 1-10), set your dream salary, and use today's date as the hire date. Set Alice (employee_id = 1) as your manager.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer`,quickRecap:`• INSERT adds new rows to a table
• You must match the number of columns with the number of values
• Strings and dates need single quotes; numbers don't
• You can skip columns that allow NULL or have defaults
• Never specify AUTO_INCREMENT columns — let MySQL handle them`,upNext:`Next topic: UPDATE → part1_03_update.md`}};export{e as default};
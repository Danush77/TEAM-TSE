var e={id:`drop-table`,status:`full`,sourceTitle:`DROP TABLE`,sourceDocuments:[{title:`DROP TABLE`,part:1,topicNumber:6,difficulty:`Beginner`,prerequisites:`create-table, alter-table`}],relatedTopicId:null,sections:{whatIsIt:`DROP TABLE completely deletes a table from your database. This removes the table structure AND all data inside it. Once dropped, the table no longer exists — it's not just empty, it's gone.

Real-world analogy: DELETE removes files from a filing cabinet. DROP TABLE destroys the entire filing cabinet itself.`,syntaxBreakdown:`DROP TABLE table_name;
That's it. Simple, powerful, and irreversible.`,basicExample:`Let's drop the office_supplies table we created earlier:

DROP TABLE office_supplies;
What this does:

Removes the table structure (column definitions, constraints, everything)
Deletes all rows of data in the table
The table name office_supplies is no longer in the database
Expected output:

Query OK, 0 rows affected
Verify it's gone:

SHOW TABLES;
You won't see office_supplies anymore.

Try to query it:

SELECT * FROM office_supplies;
Error: Table 'company_db.office_supplies' doesn't exist`,goingDeeper:`Dropping Multiple Tables at Once
DROP TABLE table1, table2, table3;
What this does:

Drops all three tables in one command
All structures and all data are gone
The Safety Net: IF EXISTS
DROP TABLE IF EXISTS office_supplies;
What this does:

If the table exists, drop it
If it doesn't exist, do nothing (no error)
Why this matters:

Safe for scripts that might run multiple times
Prevents errors in automated deployment scripts
Common in migration files
Without IF EXISTS:

DROP TABLE nonexistent_table;
Error: Unknown table 'company_db.nonexistent_table'

With IF EXISTS:

DROP TABLE IF EXISTS nonexistent_table;
Output: Query OK, 0 rows affected, 1 warning — No error, just a warning you can ignore.

Recreating After Drop
You can drop and immediately recreate a table (common pattern for resetting test data):

DROP TABLE IF EXISTS test_data;

CREATE TABLE test_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    value VARCHAR(50)
);

INSERT INTO test_data (value) VALUES ('Test 1'), ('Test 2');
What this does:

Ensures a clean slate by dropping any previous version
Creates a fresh table with the current structure
Populates it with initial data
Pause and Predict: If you DROP a table and then CREATE it again with the same name, what happens to the AUTO_INCREMENT counter?

Answer`,commonMistakes:`Mistake #1: Dropping a Table with Foreign Key References
--  MIGHT FAIL
DROP TABLE departments;
Why it might fail: The employees table has a foreign key pointing to departments. MySQL prevents you from dropping a referenced table because it would break the relationship.

Error message: Cannot drop table 'departments' referenced by a foreign key constraint

Solutions:

Option A: Drop the child table first

-- CORRECT
DROP TABLE employees;  -- Child table first
DROP TABLE departments;  -- Parent table second
Option B: Drop the foreign key constraint first

-- CORRECT
ALTER TABLE employees
DROP FOREIGN KEY employees_ibfk_1;  -- The constraint name (use SHOW CREATE TABLE to find it)

DROP TABLE departments;  -- Now you can drop it
Option C: Use CASCADE (advanced, not covered yet)

Mistake #2: Confusing DROP TABLE with DELETE
-- These are NOT the same!

DELETE FROM employees;  -- Removes all rows, table structure remains
DROP TABLE employees;   -- Removes table structure AND all rows
After DELETE:

Table still exists
You can INSERT new rows
Table structure (columns, constraints) is intact
After DROP TABLE:

Table doesn't exist
You can't INSERT anything (no table to insert into)
Must CREATE TABLE again to use it
Mistake #3: No Backup Before Dropping (Catastrophic!)
--  DANGEROUS without backup
DROP TABLE employees;
Why it's catastrophic: DROP TABLE is permanent. No undo, no recovery (unless you have backups). All employee data is gone forever.

Best practice:

-- CORRECT
-- First, back up the data
CREATE TABLE employees_backup AS
SELECT * FROM employees;

-- Verify the backup
SELECT COUNT(*) FROM employees_backup;

-- NOW you can drop safely
DROP TABLE employees;

-- If you need to restore:
CREATE TABLE employees LIKE employees_backup;  -- Copy structure
INSERT INTO employees SELECT * FROM employees_backup;  -- Copy data`,edgeCaseSpotlight:`Temporary Tables
MySQL supports temporary tables that automatically drop when your session ends:

CREATE TEMPORARY TABLE session_data (
    id INT PRIMARY KEY,
    data VARCHAR(100)
);

-- Use it like a normal table
INSERT INTO session_data VALUES (1, 'Test');
SELECT * FROM session_data;

-- When you disconnect from MySQL, this table disappears automatically
Why temporary tables matter:

Perfect for intermediate calculations
No need to explicitly DROP them
Won't conflict with tables in other sessions (each session has its own copy)
Automatically cleaned up
You can still explicitly drop them:

DROP TEMPORARY TABLE session_data;`,tryThis:`Exercise 1 (Guided)
Create a table called temp_test with any structure you like, insert a row, then drop it safely (using IF EXISTS).

Hint
Exercise 2 (Independent)
We created a meeting_rooms table earlier. Before dropping it, create a backup table called meeting_rooms_backup, verify the backup has data, then drop the original meeting_rooms table.`,answerKey:`Exercise 1 Answer
Exercise 2 Answer`,quickRecap:`• DROP TABLE permanently deletes a table and all its data
• Use IF EXISTS to avoid errors in scripts
• Can't drop tables referenced by foreign keys without dropping children first
• DROP is NOT the same as DELETE — DROP removes the entire table
• Always back up before dropping production tables`,upNext:`Time for a Challenge! → Mini Challenge 2`}};export{e as default};
var e={id:`mini-challenge-02`,title:`Mini Challenge 2 — Topics 5-6`,part:1,difficulty:`Beginner`,prerequisites:`alter-table, drop-table`,content:`Mini Challenge 2 — ALTER TABLE, DROP TABLE\r
Overview\r
You've learned how to modify existing tables (ALTER TABLE) and remove tables (DROP TABLE). Now let's practice those skills in realistic scenarios.\r
\r
Prerequisite: Make sure you've completed Mini Challenge 1 and created the customers table. If you dropped it, recreate it first:\r
\r
CREATE TABLE customers (\r
    customer_id INT PRIMARY KEY AUTO_INCREMENT,\r
    full_name VARCHAR(100) NOT NULL,\r
    email VARCHAR(100) NOT NULL UNIQUE,\r
    phone VARCHAR(15),\r
    signup_date DATE DEFAULT (CURRENT_DATE),\r
    is_active BOOLEAN DEFAULT TRUE\r
);\r
Challenge 1: Modify the Employees Table\r
The company wants to track more employee information:\r
\r
Add a column called email (VARCHAR(100))\r
Add a column called date_of_birth (DATE)\r
Add a column called is_active (BOOLEAN, default TRUE)\r
Do all three in separate ALTER TABLE statements.\r
\r
Challenge 2: Fix a Design Mistake\r
You created the customers table but forgot to make email NOT NULL. Fix it by:\r
\r
Altering the email column to add the NOT NULL constraint\r
Verify the change with DESCRIBE customers\r
Hint\r
Challenge 3: Table Cleanup\r
Drop the following tables if they exist (safely):\r
\r
office_supplies\r
meeting_rooms\r
customers\r
Any test tables you created\r
Use IF EXISTS to avoid errors.\r
\r
Challenge 4: The Complete Workflow\r
Create a table called orders:\r
\r
order_id (primary key, auto-increment)\r
customer_id (integer, foreign key to customers table... but wait, we dropped customers!)\r
order_date (datetime, defaults to current timestamp)\r
total_amount (decimal 10,2, required)\r
status (VARCHAR(20), defaults to 'pending')\r
Problem: You can't create this because customers table doesn't exist anymore!\r
\r
Your task:\r
\r
Recreate the customers table from Challenge 1\r
Create the orders table with the foreign key\r
Insert a test customer\r
Insert a test order for that customer\r
Verify both tables with SELECT\r
Answer Key\r
Challenge 1 Answer\r
Challenge 2 Answer\r
Challenge 3 Answer\r
Challenge 4 Answer\r
Key Takeaways\r
• ALTER TABLE modifies existing table structure without losing data • Use appropriate constraints (NOT NULL, UNIQUE, DEFAULT) • Create parent tables before child tables (foreign key dependencies) • Use IF EXISTS when dropping tables to avoid errors • Check for existing data before adding NOT NULL constraints • DESCRIBE shows table structure — use it to verify changes\r
\r
Up Next\r
Next topic: SELECT with FROM and WHERE → part1_07_select_from_where.md\r
\r
Now the real fun begins — querying data!`};export{e as default};
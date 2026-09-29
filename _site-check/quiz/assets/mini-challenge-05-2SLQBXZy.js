var e={id:`mini-challenge-05`,title:`Mini Challenge 5 — Topics 13-15`,part:1,difficulty:`Beginner`,prerequisites:`having-vs-where, primary-foreign-keys, inner-join`,content:`Mini Challenge 5 — HAVING, Keys, and INNER JOIN\r
Overview\r
Combine filtering grouped data, understanding relationships, and joining tables.\r
\r
Challenge 1: Popular Projects\r
Find projects that have 3 or more employees assigned. Show project_id, project_name, and employee_count. Sort by employee_count (highest first).\r
\r
Hint\r
Challenge 2: High-Earning Departments\r
Find departments where the average employee salary is greater than $70,000. Show department_name and avg_salary (rounded to 2 decimals). Sort by avg_salary descending.\r
\r
Hint\r
Challenge 3: Employee Project Details\r
Show all employee-project assignments with full details:\r
\r
employee first_name and last_name\r
project_name\r
role (from employee_projects)\r
hours_allocated (from employee_projects)\r
Sort by last_name, then project_name.\r
\r
Hint\r
Challenge 4: Departments with Few Employees\r
Find departments that have fewer than 2 employees. Show department_name and employee_count. Include departments with 0 employees (hint: you'll need a LEFT JOIN for this, but if you haven't learned it yet, just show departments with 1 employee).\r
\r
Hint\r
Challenge 5: Project Budget Report\r
For each project with more than 2 assigned employees, calculate:\r
\r
project_name\r
employee_count\r
total_hours (SUM of hours_allocated)\r
avg_hours_per_employee (total_hours / employee_count, rounded to 2 decimals)\r
Sort by total_hours (highest first).\r
\r
Hint\r
Answer Key\r
Challenge 1 Answer\r
Challenge 2 Answer\r
Challenge 3 Answer\r
Challenge 4 Answer\r
Challenge 5 Answer\r
Key Takeaways\r
• HAVING filters grouped results (after GROUP BY) • WHERE filters individual rows (before GROUP BY) • INNER JOIN returns only matching rows from both tables • Foreign keys ensure referential integrity • Multi-table JOINs enable complex queries across relationships • Combine aggregates with HAVING for powerful analytics\r
\r
Up Next\r
Next topic: LEFT JOIN → part1_16_left_join.md\r
\r
Continue learning about different types of joins!`};export{e as default};
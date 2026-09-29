var e={id:`mini-challenge-06`,title:`Mini Challenge 6 — Topics 16-18`,part:1,difficulty:`Beginner`,prerequisites:`left-join, right-join, distinct`,content:`Mini Challenge 6 — LEFT JOIN, RIGHT JOIN, and DISTINCT\r
Overview\r
Practice outer joins to include non-matching rows and eliminate duplicates.\r
\r
Challenge 1: All Departments Report\r
Show all departments with their employee count, including departments with zero employees. Show department_name and employee_count. Sort by employee_count (lowest first).\r
\r
Hint\r
Challenge 2: Employees Without Projects\r
Find all employees who are NOT assigned to any project. Show employee_id, first_name, and last_name. Sort by last_name.\r
\r
Hint\r
Challenge 3: All Projects with Employee Count\r
Show all projects with the number of employees assigned, including projects with zero employees. Show project_name and employee_count. Sort by project_name.\r
\r
Hint\r
Challenge 4: Unique Departments with Projects\r
Find all unique departments that have at least one employee working on a project. Show only department_name, no duplicates. Sort alphabetically.\r
\r
Hint\r
Challenge 5: Complete Hiring Timeline\r
Show all possible combinations of departments and hire years (from employees table), even if no one was hired in that department during that year. Show department_name, hire_year, and employee_count.\r
\r
This is advanced! You'll need to:\r
\r
Get distinct hire years from employees\r
Cross join with departments\r
Left join back to employees to count matches\r
Hint\r
Answer Key\r
Challenge 1 Answer\r
Challenge 2 Answer\r
Challenge 3 Answer\r
Challenge 4 Answer\r
Challenge 5 Answer\r
Key Takeaways\r
• LEFT JOIN keeps all rows from the left table, even without matches • RIGHT JOIN keeps all rows from the right table • Use IS NULL to find non-matching rows in outer joins • COUNT(column) counts non-NULL values, COUNT(*) counts all rows • DISTINCT eliminates duplicate rows • CROSS JOIN creates all possible combinations (Cartesian product)\r
\r
Up Next\r
Next topic: NULL Handling (IS NULL, IS NOT NULL, IFNULL) → part1_19_null_handling.md\r
\r
Learn to work with NULL values properly!`};export{e as default};
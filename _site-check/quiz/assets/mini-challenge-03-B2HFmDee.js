var e={id:`mini-challenge-03`,title:`Mini Challenge 3 — Topics 7-9`,part:1,difficulty:`Beginner`,prerequisites:`select-from-where, filtering-data, order-by`,content:`Mini Challenge 3 — SELECT, Filtering, and ORDER BY\r
Overview\r
Now that you can query data, filter results, and sort them, let's practice combining these skills in real scenarios.\r
\r
Challenge 1: Find Active Engineers\r
Find all employees in the Engineering department, sorted by last name alphabetically. Show their first_name, last_name, and salary.\r
\r
Hint\r
Join employees and departments, filter by department_name, ORDER BY last_name.\r
\r
Challenge 2: High Earners Report\r
Find all employees earning more than $80,000, sorted from highest to lowest salary. Show their full name (first and last combined), salary, and department_id.\r
\r
Hint\r
Use CONCAT for full name, WHERE salary > 80000, ORDER BY salary DESC.\r
\r
Challenge 3: Recent Hires\r
Find employees hired in 2022 or later, sorted by hire date (newest first), then by last name alphabetically. Show all columns.\r
\r
Hint\r
Use WHERE hire_date >= '2022-01-01', ORDER BY with multiple columns.\r
\r
Challenge 4: Department Search\r
Find all departments whose name contains "e" (case-insensitive), sorted by department_name. Show department_name and location.\r
\r
Hint\r
Use LIKE with % wildcards, ORDER BY department_name.\r
\r
Challenge 5: Complex Filter\r
Find employees who:\r
\r
Work in departments with ID 1, 3, or 5\r
AND earn between $60,000 and $90,000\r
AND their last name starts with a letter between A and M\r
Sort by salary (highest first), then by last_name.\r
\r
Hint\r
Use IN for department_id, BETWEEN for salary, LIKE or comparison for last_name. Multiple ORDER BY columns.\r
\r
Answer Key\r
Challenge 1 Answer\r
SELECT \r
    e.first_name,\r
    e.last_name,\r
    e.salary\r
FROM employees e\r
JOIN departments d ON e.department_id = d.department_id\r
WHERE d.department_name = 'Engineering'\r
ORDER BY e.last_name;\r
Expected output:\r
\r
first_name	last_name	salary\r
Sam	Clark	95000.00\r
Paul	Garcia	87000.00\r
Alice	Johnson	75000.00\r
All Engineering employees, sorted alphabetically by last name.\r
\r
Challenge 2 Answer\r
SELECT \r
    CONCAT(first_name, ' ', last_name) AS full_name,\r
    salary,\r
    department_id\r
FROM employees\r
WHERE salary > 80000\r
ORDER BY salary DESC;\r
Expected output:\r
\r
full_name	salary	department_id\r
Sam Clark	95000.00	1\r
Frank Miller	93000.00	2\r
Henry Moore	92000.00	4\r
Paul Garcia	87000.00	1\r
...	...	...\r
High earners sorted from highest to lowest salary.\r
\r
Challenge 3 Answer\r
SELECT *\r
FROM employees\r
WHERE hire_date >= '2022-01-01'\r
ORDER BY hire_date DESC, last_name;\r
Expected output:\r
\r
employee_id	first_name	last_name	department_id	hire_date	salary\r
20	Grace	Taylor	5	2023-09-15	62000.00\r
18	Mia	White	3	2023-06-10	57000.00\r
19	Olivia	Martin	10	2023-08-20	60000.00\r
...	...	...	...	...	...\r
Recent hires, newest first, then alphabetical.\r
\r
Challenge 4 Answer\r
SELECT department_name, location\r
FROM departments\r
WHERE department_name LIKE '%e%'\r
ORDER BY department_name;\r
Expected output:\r
\r
department_name	location\r
Business Development	Seattle\r
Customer Support	Chicago\r
Data Science	Austin\r
Engineering	San Francisco\r
Legal	New York\r
Marketing	New York\r
All departments with "e" in their name, sorted alphabetically.\r
\r
Challenge 5 Answer\r
SELECT *\r
FROM employees\r
WHERE department_id IN (1, 3, 5)\r
  AND salary BETWEEN 60000 AND 90000\r
  AND last_name < 'N'\r
ORDER BY salary DESC, last_name;\r
Expected output:\r
\r
employee_id	first_name	last_name	department_id	hire_date	salary\r
2	Bob	Smith	3	2020-05-10	82000.00\r
1	Alice	Johnson	1	2019-03-15	75000.00\r
9	Ivy	Anderson	5	2018-02-20	74000.00\r
20	Grace	Taylor	5	2023-09-15	62000.00\r
Employees matching all criteria, sorted by salary (high to low), then last name.\r
\r
Note: last_name < 'N' means last names starting with A-M (since 'N' comes after 'M' alphabetically).\r
\r
Key Takeaways\r
• Combine SELECT, WHERE, and ORDER BY for precise queries • Use JOINs to access related data across tables • CONCAT formats output for better readability • Multiple ORDER BY columns provide fine-grained sorting • LIKE with wildcards finds pattern matches • IN, BETWEEN, and comparison operators filter ranges and sets\r
\r
Up Next\r
Next topic: LIMIT → part1_10_limit.md\r
\r
Ready to learn result limiting?`};export{e as default};
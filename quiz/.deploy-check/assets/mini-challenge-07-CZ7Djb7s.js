var e={id:`mini-challenge-07`,title:`Mini Challenge 7 — Topics 19-20 + Preview`,part:1,difficulty:`Beginner`,prerequisites:`null-handling, string-functions-upper-lower, substring`,content:`Mini Challenge 7 — NULL Handling, String Functions, and SUBSTRING\r
Overview\r
Master NULL handling and string manipulation in realistic scenarios.\r
\r
Challenge 1: Clean Email List\r
Some employees might not have email addresses. Create a report showing:\r
\r
first_name\r
last_name\r
email (if NULL, show 'No Email Provided')\r
email_status: 'Has Email' or 'Missing Email'\r
Sort by last_name.\r
\r
Hint\r
Challenge 2: Standardized Department Names\r
Create a report with department names in three formats:\r
\r
Original department_name\r
uppercase_name (all caps)\r
lowercase_name (all lowercase)\r
initials (first letter of each word, uppercase)\r
Sort alphabetically by original name.\r
\r
Hint\r
Challenge 3: Find Incomplete Records\r
Find all employees who have NULL values in any column EXCEPT employee_id. Show employee_id, first_name, last_name, and which field is NULL (use a text description).\r
\r
Hint\r
Challenge 4: Project Name Abbreviations\r
Create 3-letter abbreviations for all project names using the first 3 characters, in uppercase. Show project_name and abbreviation. Sort by abbreviation.\r
\r
Hint\r
Challenge 5: Conditional Email Generation\r
Generate email addresses for employees:\r
\r
If they have an email column (even if NULL), use it\r
If email is NULL, generate one as: first 3 letters of first name + last name + '@company.com', all lowercase\r
Show first_name, last_name, and generated_email.\r
\r
Hint\r
Answer Key\r
Challenge 1 Answer\r
Challenge 2 Answer\r
Challenge 3 Answer\r
Challenge 4 Answer\r
Challenge 5 Answer\r
Key Takeaways\r
• Use IFNULL/COALESCE to handle NULL values gracefully • IS NULL and IS NOT NULL for NULL checks (never use = NULL) • UPPER() and LOWER() normalize text case • SUBSTRING extracts portions of strings • CONCAT builds strings from parts • Combine these functions for powerful data transformations\r
\r
Part 1 Mini Challenges Complete!\r
You've practiced all foundational skills through realistic scenarios. Ready for Part 2?\r
\r
Up Next\r
Part 2: CASE WHEN (Conditional Logic) → part2_02_case_when.md`};export{e as default};
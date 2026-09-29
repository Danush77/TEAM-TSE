var e={id:`substring`,status:`full`,sourceTitle:`SUBSTRING`,sourceDocuments:[{title:`SUBSTRING`,part:2,topicNumber:1,difficulty:`Intermediate`,prerequisites:`string-functions-upper-lower`}],relatedTopicId:null,sections:{whatIsIt:`SUBSTRING — Extract Parts of Text
SUBSTRING() (also written as SUBSTR()) extracts a portion of a string. It's like cutting out a specific section of text — you specify where to start and how many characters to take.

Real-world analogy: Like highlighting a specific word or phrase in a document.

When you'd use it:

Extract area codes from phone numbers
Get the first letter of a name
Parse formatted codes (like 'EMP-12345' → '12345')
Extract year/month from date strings`,syntaxBreakdown:`SUBSTRING(string, start_position, length)
-- Or
SUBSTRING(string FROM start_position FOR length)
Parameters:

string: The text to extract from (column or literal)
start_position: Where to begin (1 = first character)
length: How many characters to extract (optional — if omitted, takes everything from start to end)
Key points:

Positions are 1-indexed (first character is position 1, not 0)
If start_position is negative, counts from the end (-1 = last character)
If length exceeds string length, returns as much as available
Returns NULL if input is NULL`,basicExample:`Extract First 3 Characters
SELECT 
    first_name,
    SUBSTRING(first_name, 1, 3) AS first_three
FROM employees
LIMIT 5;
Expected output:

first_name	first_three
Alice	Ali
Bob	Bob
Carol	Car
David	Dav
Eve	Eve
What happened: Started at position 1, took 3 characters.

Extract Last 4 Characters (Negative Position)
SELECT 
    project_name,
    SUBSTRING(project_name, -4) AS last_four
FROM projects
LIMIT 5;
Expected output:

project_name	last_four
Website Redesign	sign
Mobile App	App
CRM System	stem
API Development	ment
Data Pipeline	line
What happened: Negative position counts from the end. -4 means "start 4 characters from the end".

Extract Middle Section
SELECT 
    'EMP-12345' AS employee_code,
    SUBSTRING('EMP-12345', 5, 5) AS id_number;
Expected output:

employee_code	id_number
EMP-12345	12345
What happened: Started at position 5 (after 'EMP-'), took 5 characters.`,goingDeeper:`Parse Phone Numbers
Imagine employees have phone numbers in format '(555) 123-4567':

-- Create test data
SELECT 
    '(555) 123-4567' AS phone,
    SUBSTRING('(555) 123-4567', 2, 3) AS area_code,
    SUBSTRING('(555) 123-4567', 7, 3) AS prefix,
    SUBSTRING('(555) 123-4567', 11, 4) AS line_number;
Expected output:

phone	area_code	prefix	line_number
(555) 123-4567	555	123	4567
Positions:

Area code: starts at 2 (after '('), length 3
Prefix: starts at 7 (after ') '), length 3
Line: starts at 11 (after '-'), length 4
Extract Domain from Email
SELECT 
    'alice.johnson@company.com' AS email,
    SUBSTRING('alice.johnson@company.com', 
              LOCATE('@', 'alice.johnson@company.com') + 1
    ) AS domain;
Expected output:

email	domain
alice.johnson@company.com	company.com
How it works:

LOCATE('@', email) finds position of '@' (15)
+ 1 moves past the '@'
SUBSTRING from that position to end
Advanced: You'll learn LOCATE in advanced topics, but this shows SUBSTRING's power when combined with other functions.

Create Initials
SELECT 
    first_name,
    last_name,
    CONCAT(
        UPPER(SUBSTRING(first_name, 1, 1)),
        '.',
        UPPER(SUBSTRING(last_name, 1, 1)),
        '.'
    ) AS initials
FROM employees
LIMIT 5;
Expected output:

first_name	last_name	initials
Alice	Johnson	A.J.
Bob	Smith	B.S.
Carol	Williams	C.W.
David	Brown	D.B.
Eve	Davis	E.D.
Professional formatting with first and last initials.

Pause and Predict: What does SUBSTRING('Hello', 1, 100) return?

Answer`,commonMistakes:`Mistake #1: Using 0-Based Indexing
-- WRONG (trying to use 0-based indexing)
SELECT SUBSTRING('Hello', 0, 3);
-- Returns: 'Hel' (MySQL treats 0 as 1)
What programmers expect: 'Hel' (characters at positions 0, 1, 2)

What MySQL does: Treats position 0 as position 1, so returns 'Hel' anyway (but this is confusing!)

Better:

-- CORRECT (explicit 1-based indexing)
SELECT SUBSTRING('Hello', 1, 3);
-- Returns: 'Hel'
Key: Always use 1 for the first character.

Mistake #2: Forgetting Length Parameter
SELECT SUBSTRING('EMP-12345', 5);
What beginners think: "This will return 5 characters."

What actually happens: Returns everything from position 5 to the end: '12345'

When this is useful: Extracting "from here to the end"

When you need a specific length: Always include the third parameter:

SELECT SUBSTRING('EMP-12345', 5, 3);  -- Returns: '123'
Mistake #3: Not Handling NULL
--  Assumes column has values
SELECT SUBSTRING(middle_name, 1, 1) AS middle_initial
FROM employees;
Problem: If middle_name is NULL, result is NULL (not an error, but might surprise you).

Better:

-- • Handle NULL explicitly
SELECT IFNULL(SUBSTRING(middle_name, 1, 1), '') AS middle_initial
FROM employees;
Or:

SELECT 
    CASE 
        WHEN middle_name IS NOT NULL THEN SUBSTRING(middle_name, 1, 1)
        ELSE 'N/A'
    END AS middle_initial
FROM employees;`,edgeCaseSpotlight:`Negative Length (Not Supported)
SELECT SUBSTRING('Hello', 2, -1);
-- Returns: '' (empty string)
MySQL doesn't support negative length. If you provide a negative number, it returns an empty string (not an error).

Multibyte Characters (UTF-8)
SELECT 
    'Café' AS word,
    SUBSTRING('Café', 1, 3) AS first_three,
    LENGTH('Café') AS byte_length,
    CHAR_LENGTH('Café') AS char_length;
Expected output:

word	first_three	byte_length	char_length
Café	Caf	5	4
What's happening:

'é' takes 2 bytes in UTF-8
SUBSTRING works with characters, not bytes (returns 'Caf')
LENGTH counts bytes (5)
CHAR_LENGTH counts characters (4)
In MySQL 8+ with utf8mb4: SUBSTRING handles international characters correctly.`,tryThis:`Exercise 1 (Guided)
Extract the first letter of each employee's last name, in uppercase. Show last_name and first_letter. Sort alphabetically by first_letter.

Hint
Exercise 2 (Independent)
For all projects, create a "short name" that is the first 10 characters of project_name. If project_name is less than 10 characters, show the full name. Show project_name and short_name.

Hint
Exercise 3 (Challenge)
Extract the last 3 characters of each employee's email address (the domain extension, like 'com', 'org', etc.). Show email and extension. Handle NULL emails by displaying 'N/A'.

Hint`,answerKey:`Exercise 1 Answer
Exercise 2 Answer
Exercise 3 Answer`,quickRecap:`• SUBSTRING(string, start, length) extracts text portions
• Positions are 1-indexed (first character = 1)
• Negative positions count from the end
• Omit length to get "from here to end"
• Returns NULL if input is NULL
• Handles UTF-8 characters correctly in MySQL 8+
• Combine with CONCAT, UPPER, LOWER for powerful transformations`,upNext:`Time for a Challenge! → Mini Challenge 7

You've completed Part 1 foundations and learned SUBSTRING! Test your combined skills with a comprehensive challenge.`}};export{e as default};
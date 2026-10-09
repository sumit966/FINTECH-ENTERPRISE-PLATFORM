-- ============================================================
-- Update email domain: .example -> .in across all tables
-- Update founder name: Sumit Raj -> Sumit Kumar
-- ============================================================

-- Founder name
UPDATE "Employee"
SET "fullName" = 'Sumit Kumar'
WHERE "employeeCode" = 'FITS-0001';

UPDATE "User"
SET "fullName" = 'Sumit Kumar'
WHERE email = 'founder@fintechitsolutions.example'
   OR email = 'founder@fintechitsolutions.in';

-- Employee emails and personal emails
UPDATE "Employee"
SET email = REPLACE(email, '@fintechitsolutions.example', '@fintechitsolutions.in')
WHERE email LIKE '%@fintechitsolutions.example';

UPDATE "Employee"
SET "personalEmail" = REPLACE("personalEmail", '@gmail.example', '@gmail.in')
WHERE "personalEmail" LIKE '%@gmail.example';

-- User login emails
UPDATE "User"
SET email = REPLACE(email, '@fintechitsolutions.example', '@fintechitsolutions.in')
WHERE email LIKE '%@fintechitsolutions.example';

-- Candidate emails
UPDATE "Candidate"
SET email = REPLACE(email, '@example.com', '@example.in')
WHERE email LIKE '%@example.com';

-- Client contact emails
UPDATE "ClientContact"
SET email = REPLACE(REPLACE(email, '@fintechitsolutions.example', '@fintechitsolutions.in'), '@.example', '@.in')
WHERE email LIKE '%.example%';

-- Vendor emails
UPDATE "Vendor"
SET email = REPLACE(email, '.example', '.in')
WHERE email LIKE '%.example';

-- Audit log user emails
UPDATE "AuditLog"
SET "userEmail" = REPLACE("userEmail", '@fintechitsolutions.example', '@fintechitsolutions.in')
WHERE "userEmail" LIKE '%@fintechitsolutions.example';

-- Notifications reference user emails via user id, no change needed
-- but notification content may still have the founder's old name
UPDATE "Notification"
SET body = REPLACE(body, 'Sumit Raj', 'Sumit Kumar')
WHERE body LIKE '%Sumit Raj%';

UPDATE "Notification"
SET title = REPLACE(title, 'Sumit Raj', 'Sumit Kumar')
WHERE title LIKE '%Sumit Raj%';

-- Sanity report
SELECT 'Employee with old domain' AS check_name, COUNT(*) FROM "Employee" WHERE email LIKE '%.example%'
UNION ALL SELECT 'User with old domain', COUNT(*) FROM "User" WHERE email LIKE '%.example%'
UNION ALL SELECT 'Candidate with old domain', COUNT(*) FROM "Candidate" WHERE email LIKE '%.example%'
UNION ALL SELECT 'ClientContact with old domain', COUNT(*) FROM "ClientContact" WHERE email LIKE '%.example%'
UNION ALL SELECT 'Vendor with old domain', COUNT(*) FROM "Vendor" WHERE email LIKE '%.example%'
UNION ALL SELECT 'AuditLog with old domain', COUNT(*) FROM "AuditLog" WHERE "userEmail" LIKE '%.example%'
UNION ALL SELECT 'Founder still named Sumit Raj', COUNT(*) FROM "Employee" WHERE "fullName" = 'Sumit Raj'
UNION ALL SELECT 'Founder named Sumit Kumar', COUNT(*) FROM "Employee" WHERE "fullName" = 'Sumit Kumar';
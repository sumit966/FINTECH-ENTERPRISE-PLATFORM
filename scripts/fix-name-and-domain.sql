-- Founder rename
UPDATE "Employee" SET "fullName" = 'Sumit Kumar' WHERE "employeeCode" = 'FITS-0001';
UPDATE "User" SET "fullName" = 'Sumit Kumar' WHERE email LIKE 'founder@%';

-- Email domain migration to .in
UPDATE "Employee" SET email = REPLACE(email, '.example', '.in') WHERE email LIKE '%.example%';
UPDATE "User" SET email = REPLACE(email, '.example', '.in') WHERE email LIKE '%.example%';
UPDATE "AuditLog" SET "userEmail" = REPLACE("userEmail", '.example', '.in') WHERE "userEmail" LIKE '%.example%';

-- Ireland: ensure we have exactly 2
-- UAE: ensure we have exactly 2
-- (rows already exist; just report)

SELECT 'Founder name' AS check_name, "fullName" AS value FROM "Employee" WHERE "employeeCode" = 'FITS-0001'
UNION ALL SELECT 'Ireland clients', COUNT(*)::text FROM "Client" WHERE country = 'Ireland'
UNION ALL SELECT 'UAE clients', COUNT(*)::text FROM "Client" WHERE country = 'UAE'
UNION ALL SELECT 'India clients', COUNT(*)::text FROM "Client" WHERE country = 'India'
UNION ALL SELECT 'Employees with old .example', COUNT(*)::text FROM "Employee" WHERE email LIKE '%.example%'
UNION ALL SELECT 'Total clients', COUNT(*)::text FROM "Client";
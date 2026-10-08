SELECT 'Attendance' AS table_name, COUNT(*) FROM "Attendance"
UNION ALL SELECT 'Leave',       COUNT(*) FROM "Leave"
UNION ALL SELECT 'Payroll',     COUNT(*) FROM "Payroll";
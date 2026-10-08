SELECT 'Location' AS table_name, COUNT(*) FROM "Location"
UNION ALL SELECT 'Department', COUNT(*) FROM "Department"
UNION ALL SELECT 'Team', COUNT(*) FROM "Team"
UNION ALL SELECT 'Role', COUNT(*) FROM "Role"
UNION ALL SELECT 'Permission', COUNT(*) FROM "Permission"
UNION ALL SELECT 'User', COUNT(*) FROM "User"
UNION ALL SELECT 'UserRole', COUNT(*) FROM "UserRole"
UNION ALL SELECT 'RolePermission', COUNT(*) FROM "RolePermission";
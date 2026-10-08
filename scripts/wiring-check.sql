SELECT
  e."employeeCode",
  e."fullName",
  l.code AS loc,
  d.code AS dept,
  t.code AS team,
  m."fullName" AS manager
FROM "Employee" e
JOIN "Location" l ON l.id = e."locationId"
JOIN "Department" d ON d.id = e."departmentId"
LEFT JOIN "Team" t ON t.id = e."teamId"
LEFT JOIN "Employee" m ON m.id = e."managerId"
WHERE e."employeeCode" IN ('FITS-0001','FITS-0002','FITS-0013','FITS-0500')
ORDER BY e."employeeCode";
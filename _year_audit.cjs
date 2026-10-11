const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './backend/.env' });
(async () => {
  const p = new PrismaClient();

  // Payroll by year
  const payByYear = await p.$queryRawUnsafe(
    'SELECT year, COUNT(*)::int AS rows, SUM("netSalary")::float AS net FROM "Payroll" GROUP BY year ORDER BY year'
  );
  console.log('=== Payroll by year ===');
  console.log(payByYear);

  // Attendance by year
  const attByYear = await p.$queryRawUnsafe(
    "SELECT EXTRACT(YEAR FROM date)::int AS y, COUNT(*)::int AS rows FROM \"Attendance\" GROUP BY y ORDER BY y"
  );
  console.log('=== Attendance by year ===');
  console.log(attByYear);

  // Projects by start year
  const projByYear = await p.$queryRawUnsafe(
    "SELECT EXTRACT(YEAR FROM \"startDate\")::int AS y, COUNT(*)::int AS rows FROM \"Project\" GROUP BY y ORDER BY y"
  );
  console.log('=== Projects by start-year ===');
  console.log(projByYear);

  // Employees by joining year
  const empByYear = await p.$queryRawUnsafe(
    "SELECT EXTRACT(YEAR FROM \"joiningDate\")::int AS y, COUNT(*)::int AS rows FROM \"Employee\" GROUP BY y ORDER BY y"
  );
  console.log('=== Employees by joining-year ===');
  console.log(empByYear);

  // Anything with 2023 dates that shouldn't be there?
  const pay2023 = await p.payroll.count({ where: { year: 2023 } });
  const att2023 = await p.$queryRawUnsafe("SELECT COUNT(*)::int AS c FROM \"Attendance\" WHERE EXTRACT(YEAR FROM date) = 2023");
  console.log('=== 2023 rows ===');
  console.log({ payroll2023: pay2023, attendance2023: att2023 });

  await p.$disconnect();
})();

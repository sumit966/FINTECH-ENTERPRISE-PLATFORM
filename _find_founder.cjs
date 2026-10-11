const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './backend/.env' });
(async () => {
  const p = new PrismaClient();
  const users = await p.user.findMany({
    where: { userRoles: { some: { role: { code: { in: ['FOUNDER_CEO'] } } } } },
    include: { employee: true },
  });
  const founder = users.map((u) => ({
    email: u.email,
    employeeId: u.employee ? u.employee.id : null,
    employeeCode: u.employee ? u.employee.employeeCode : null,
    fullName: u.employee ? u.employee.fullName : null,
    employmentStatus: u.employee ? u.employee.employmentStatus : null,
  }));
  console.log('=== FOUNDER USERS ===');
  console.log(JSON.stringify(founder, null, 2));

  // Also: does any payroll record currently exist for these founder employees?
  for (const u of users) {
    if (!u.employee) continue;
    const count = await p.payroll.count({ where: { employeeId: u.employee.id } });
    console.log('payroll rows for', u.employee.employeeCode, ':', count);
  }

  // Also: current salary-like fields on employee (in case salary is on employee, not payroll)
  for (const u of users) {
    if (!u.employee) continue;
    const emp = await p.employee.findUnique({
      where: { id: u.employee.id },
      select: { id: true, employeeCode: true, fullName: true, employmentStatus: true, designation: true },
    });
    console.log('=== employee record ===');
    console.log(JSON.stringify(emp, null, 2));
  }

  await p.$disconnect();
})();

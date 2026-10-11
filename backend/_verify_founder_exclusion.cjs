const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
(async () => {
  const p = new PrismaClient();
  const all = await p.payroll.aggregate({
    _sum: { netSalary: true },
    where: { status: 'PAID' },
  });
  const withoutFounder = await p.payroll.aggregate({
    _sum: { netSalary: true },
    where: { status: 'PAID', employee: { employeeCode: { not: 'FITS-0001' } } },
  });
  const founderTotal = await p.payroll.aggregate({
    _sum: { netSalary: true },
    where: { status: 'PAID', employee: { employeeCode: 'FITS-0001' } },
  });
  console.log('All PAID net sum  :', Number(all._sum.netSalary || 0).toLocaleString('en-IN'));
  console.log('Excl. founder     :', Number(withoutFounder._sum.netSalary || 0).toLocaleString('en-IN'));
  console.log('Founder only      :', Number(founderTotal._sum.netSalary || 0).toLocaleString('en-IN'));
  console.log('Delta matches?    :', Number(all._sum.netSalary || 0) - Number(withoutFounder._sum.netSalary || 0) === Number(founderTotal._sum.netSalary || 0));
  await p.$disconnect();
})();

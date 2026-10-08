// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Payroll seeder
// Inserts 12,000 payroll rows. Idempotent.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { payrollData } from '../database/data/payroll.data';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding payroll (' + payrollData.length + ' rows) ...');

  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));
  const founder = emps.find((e) => e.employeeCode === 'FITS-0001');
  const approverId = founder ? founder.id : null;

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < payrollData.length; i++) {
    const p = payrollData[i];
    const employeeId = empIdByCode.get(p.employeeCode);
    if (!employeeId) { errors++; continue; }
    try {
      await prisma.payroll.upsert({
        where: { payrollCode: p.payrollCode },
        update: {
          status: p.status,
          paymentDate: p.paymentDate,
        },
        create: {
          payrollCode: p.payrollCode,
          employeeId,
          month: p.month,
          year: p.year,
          basicSalary: p.basicSalary,
          hra: p.hra,
          allowances: p.allowances,
          bonus: p.bonus,
          grossSalary: p.grossSalary,
          tax: p.tax,
          deductions: p.deductions,
          netSalary: p.netSalary,
          status: p.status,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          department: p.department,
          location: p.location,
          approvedById: p.status === 'PAID' ? approverId : null,
        },
      });
      inserted++;
    } catch (_e) { errors++; }
    if (inserted % 2000 === 0 && inserted > 0) {
      console.log('  ...progress: ' + inserted + ' inserted, ' + errors + ' errors');
    }
  }

  console.log('  [OK] Payroll rows: ' + inserted + ' (errors: ' + errors + ')');
  console.log('Payroll seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
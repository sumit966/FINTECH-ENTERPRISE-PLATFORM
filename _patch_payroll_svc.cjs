const fs = require('fs');
const p = 'backend/src/services/payrollService.ts';
let s = fs.readFileSync(p, 'utf8');

// 1) Add a constant for the founder employee code near the top
if (!/FOUNDER_EMPLOYEE_CODE/.test(s)) {
  s = s.replace(
    /import \{ paginated \} from '..\/utils\/apiResponse';/,
    "import { paginated } from '../utils/apiResponse';\n\n// Founder does not draw a salary. Excluded from all payroll aggregates\n// but their rows remain in the database for audit and history.\nconst FOUNDER_EMPLOYEE_CODE = 'FITS-0001';"
  );
}

// 2) Rewrite getPayrollSummary to exclude founder + add period range
const summaryStart = s.indexOf('export async function getPayrollSummary');
const summaryEnd = s.indexOf('export async function getPayrollMonthlyTrend');
if (summaryStart === -1 || summaryEnd === -1) {
  console.error('Could not locate getPayrollSummary block');
  process.exit(1);
}

const newSummary = `export async function getPayrollSummary() {
  // Founder is excluded from every aggregate. Their rows still exist in the
  // Payroll table and remain visible in the list view for audit purposes.
  const excludeFounder = { employee: { employeeCode: { not: FOUNDER_EMPLOYEE_CODE } } };

  const [totalRows, statusBreakdown, lifetimeAgg, latestMonthAgg, earliestMonthAgg, employeeCount] = await Promise.all([
    prisma.payroll.count(),
    prisma.payroll.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: excludeFounder,
    }),
    prisma.payroll.aggregate({
      _sum: { grossSalary: true, netSalary: true, tax: true },
      where: { status: 'PAID', ...excludeFounder },
    }),
    prisma.payroll.findFirst({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: { year: true, month: true },
    }),
    prisma.payroll.findFirst({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      select: { year: true, month: true },
    }),
    prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
  ]);

  const totalGrossLifetime = Number(lifetimeAgg._sum.grossSalary || 0);
  const totalNetLifetime = Number(lifetimeAgg._sum.netSalary || 0);
  const totalTaxLifetime = Number(lifetimeAgg._sum.tax || 0);

  const fmt = (y: number, m: number) => y + '-' + String(m).padStart(2, '0');
  const latestPeriod = latestMonthAgg ? fmt(latestMonthAgg.year, latestMonthAgg.month) : null;
  const earliestPeriod = earliestMonthAgg ? fmt(earliestMonthAgg.year, earliestMonthAgg.month) : null;

  return {
    totalRows,
    paidRows: statusBreakdown.find((s) => s.status === 'PAID')?._count._all ?? 0,
    pendingRows: statusBreakdown.find((s) => s.status === 'PENDING')?._count._all ?? 0,
    failedRows: statusBreakdown.find((s) => s.status === 'FAILED')?._count._all ?? 0,

    // Lifetime (not YTD) — renamed to match the data reality
    totalGrossPaidLifetime: totalGrossLifetime,
    totalNetPaidLifetime: totalNetLifetime,
    totalTaxLifetime: totalTaxLifetime,

    // Backwards-compatible aliases so existing UI doesn't break
    totalGrossPaidYtd: totalGrossLifetime,
    totalNetPaidYtd: totalNetLifetime,
    totalTaxYtd: totalTaxLifetime,

    latestPayrollPeriod: latestPeriod,
    earliestPayrollPeriod: earliestPeriod,
    periodLabel: earliestPeriod && latestPeriod
      ? earliestPeriod + ' \\u2192 ' + latestPeriod + ' (lifetime)'
      : null,

    activeEmployeeCount: employeeCount,
    founderExcluded: true,
    founderEmployeeCode: FOUNDER_EMPLOYEE_CODE,
  };
}

`;

s = s.slice(0, summaryStart) + newSummary + s.slice(summaryEnd);

// 3) getPayrollMonthlyTrend — exclude founder
s = s.replace(
  /where: \{ status: 'PAID' \},\n(\s*)orderBy: \[\{ year: 'desc' \}, \{ month: 'desc' \}\],/,
  "where: { status: 'PAID', employee: { employeeCode: { not: FOUNDER_EMPLOYEE_CODE } } },\n$1orderBy: [{ year: 'desc' }, { month: 'desc' }],"
);

// 4) getPayrollByDepartment — exclude founder
s = s.replace(
  /where: \{ month, year, status: 'PAID' \},/,
  "where: { month, year, status: 'PAID', employee: { employeeCode: { not: FOUNDER_EMPLOYEE_CODE } } },"
);

fs.writeFileSync(p, s);
console.log('payrollService.ts patched');

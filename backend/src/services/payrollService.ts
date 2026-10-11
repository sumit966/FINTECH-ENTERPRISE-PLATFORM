import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

// Founder does not draw a salary. Excluded from all payroll aggregates
// but their rows remain in the database for audit and history.
const FOUNDER_EMPLOYEE_CODE = 'FITS-0001';

export interface ListPayrollParams {
  page: number;
  pageSize: number;
  month?: number;
  year?: number;
  departmentCode?: string;
  locationCode?: string;
  status?: string;
  search?: string;
}

export async function listPayroll(params: ListPayrollParams) {
  const { page, pageSize, month, year, departmentCode, locationCode, status, search } = params;

  const where: Prisma.PayrollWhereInput = {};
  if (month) where.month = month;
  if (year) where.year = year;
  if (status) where.status = status as any;
  if (departmentCode) where.department = departmentCode;
  if (locationCode) where.location = locationCode;
  if (search && search.trim()) {
    where.OR = [
      { payrollCode: { contains: search.trim(), mode: 'insensitive' } },
      { employee: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
      { employee: { employeeCode: { contains: search.trim(), mode: 'insensitive' } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.payroll.count({ where }),
    prisma.payroll.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { payrollCode: 'asc' }],
      include: {
        employee: {
          select: {
            employeeCode: true,
            fullName: true,
            location: { select: { code: true, city: true } },
            department: { select: { code: true, name: true } },
          },
        },
      },
    }),
  ]);

  const items = rows.map((p) => ({
    id: p.id,
    payrollCode: p.payrollCode,
    employeeCode: p.employee.employeeCode,
    employeeName: p.employee.fullName,
    month: p.month,
    year: p.year,
    departmentCode: p.employee.department.code,
    departmentName: p.employee.department.name,
    locationCode: p.employee.location.code,
    locationCity: p.employee.location.city,
    basicSalary: Number(p.basicSalary),
    hra: Number(p.hra),
    allowances: Number(p.allowances),
    bonus: Number(p.bonus),
    grossSalary: Number(p.grossSalary),
    tax: Number(p.tax),
    deductions: Number(p.deductions),
    netSalary: Number(p.netSalary),
    status: p.status,
    paymentDate: p.paymentDate,
    paymentMethod: p.paymentMethod,
  }));

  return paginated(items, page, pageSize, total);
}

export async function getPayrollSummary() {
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
      ? earliestPeriod + ' \u2192 ' + latestPeriod + ' (lifetime)'
      : null,

    activeEmployeeCount: employeeCount,
    founderExcluded: true,
    founderEmployeeCode: FOUNDER_EMPLOYEE_CODE,
  };
}

export async function getPayrollMonthlyTrend(months: number = 12) {
  const rows = await prisma.payroll.groupBy({
    by: ['year', 'month'],
    _sum: { grossSalary: true, netSalary: true },
    _count: { _all: true },
    where: { status: 'PAID', employee: { employeeCode: { not: FOUNDER_EMPLOYEE_CODE } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: months,
  });
  return rows
    .map((r) => ({
      year: r.year,
      month: r.month,
      label: r.year + '-' + String(r.month).padStart(2, '0'),
      gross: Number(r._sum.grossSalary || 0),
      net: Number(r._sum.netSalary || 0),
      rowCount: r._count._all,
    }))
    .reverse();
}

export async function getPayrollByDepartment(month: number, year: number) {
  const rows = await prisma.payroll.groupBy({
    by: ['department'],
    _sum: { netSalary: true, grossSalary: true, tax: true },
    _count: { _all: true },
    where: { month, year, status: 'PAID', employee: { employeeCode: { not: FOUNDER_EMPLOYEE_CODE } } },
  });
  return rows
    .map((r) => ({
      departmentCode: r.department,
      totalNet: Number(r._sum.netSalary || 0),
      totalGross: Number(r._sum.grossSalary || 0),
      totalTax: Number(r._sum.tax || 0),
      count: r._count._all,
    }))
    .sort((a, b) => b.totalNet - a.totalNet);
}

export async function getEmployeePayrollHistory(employeeCode: string, limit: number = 24) {
  const rows = await prisma.payroll.findMany({
    where: { employee: { employeeCode } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: limit,
  });
  return rows.map((p) => ({
    payrollCode: p.payrollCode,
    month: p.month,
    year: p.year,
    grossSalary: Number(p.grossSalary),
    tax: Number(p.tax),
    deductions: Number(p.deductions),
    netSalary: Number(p.netSalary),
    status: p.status,
    paymentDate: p.paymentDate,
    paymentMethod: p.paymentMethod,
  }));
}
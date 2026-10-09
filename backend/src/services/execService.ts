import { prisma } from '../config/prisma';

export async function getExecutiveSnapshot() {
  const now = new Date();
  const ytdFrom = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const monthFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    headcount, activeProjects, totalProjects, clients,
    revenuePaid, revenueInvoiced, payrollNetYtd,
    openInvoices, overdueInvoices, overdueAmount,
    openSecurity, criticalSecurity,
    attendanceToday, onLeaveToday,
    recentAudit,
    projectHealth, riskScore,
  ] = await Promise.all([
    prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { status: 'PAID' } }),
    prisma.invoice.aggregate({ _sum: { total: true } }),
    prisma.payroll.aggregate({ _sum: { netSalary: true }, where: { status: 'PAID', year: now.getUTCFullYear() } }),
    prisma.invoice.count({ where: { status: 'SENT' } }),
    prisma.invoice.count({ where: { status: 'OVERDUE' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'OVERDUE' } }),
    prisma.securityEvent.count({ where: { status: 'OPEN' } }),
    prisma.securityEvent.count({ where: { status: 'OPEN', severity: 'CRITICAL' } }),
    prisma.attendance.count({ where: { date: { gte: monthFrom }, status: { in: ['PRESENT','WFH','LATE','OVERTIME'] } } }),
    prisma.leave.count({ where: { status: 'APPROVED', startDate: { lte: now }, endDate: { gte: now } } }),
    prisma.auditLog.findMany({ take: 12, orderBy: { createdAt: 'desc' }, select: { id: true, userEmail: true, action: true, module: true, createdAt: true } }),
    prisma.project.aggregate({ _avg: { healthScore: true } }),
    prisma.project.aggregate({ _avg: { riskScore: true } }),
  ]);

  return {
    headcount,
    activeProjects,
    totalProjects,
    clients,
    revenuePaid: Number(revenuePaid._sum.paidAmount || 0),
    revenueInvoiced: Number(revenueInvoiced._sum.total || 0),
    payrollNetYtd: Number(payrollNetYtd._sum.netSalary || 0),
    openInvoices,
    overdueInvoices,
    overdueAmount: Number(overdueAmount._sum.total || 0),
    openSecurity,
    criticalSecurity,
    attendanceThisMonth: attendanceToday,
    onLeaveToday,
    avgProjectHealth: Number(projectHealth._avg.healthScore || 0),
    avgProjectRisk: Number(riskScore._avg.riskScore || 0),
    recentAudit,
    ytdFrom,
  };
}

export async function getOrgTree() {
  const locations = await prisma.location.findMany({
    select: { code: true, city: true, _count: { select: { employees: true } } },
  });
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { code: true, name: true, category: true, _count: { select: { employees: true } } },
  });

  // location × department grid
  const rows = await prisma.employee.groupBy({
    by: ['locationId', 'departmentId'],
    _count: { _all: true },
  });
  const locById = new Map(locations.map((l) => [l.code, l]));
  const locsFull = await prisma.location.findMany({ select: { id: true, code: true } });
  const deptsFull = await prisma.department.findMany({ select: { id: true, code: true } });
  const locCodeById = new Map(locsFull.map((l) => [l.id, l.code]));
  const deptCodeById = new Map(deptsFull.map((d) => [d.id, d.code]));

  const grid: { locationCode: string; departmentCode: string; count: number }[] = rows.map((r) => ({
    locationCode: locCodeById.get(r.locationId) || '—',
    departmentCode: deptCodeById.get(r.departmentId) || '—',
    count: r._count._all,
  }));

  return {
    locations: locations.map((l) => ({ code: l.code, city: l.city, count: l._count.employees })),
    departments: departments.map((d) => ({ code: d.code, name: d.name, category: d.category, count: d._count.employees })).sort((a, b) => b.count - a.count),
    grid,
  };
}

export async function getRevenueTrend(months = 12) {
  const now = new Date();
  const points: { label: string; revenue: number; payroll: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    const [rev, pay] = await Promise.all([
      prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { paidDate: { gte: d, lt: to } } }),
      prisma.payroll.aggregate({ _sum: { netSalary: true }, where: { status: 'PAID', year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 } }),
    ]);
    points.push({
      label: d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'),
      revenue: Number(rev._sum.paidAmount || 0),
      payroll: Number(pay._sum.netSalary || 0),
    });
  }
  return points;
}

export async function getRiskRadar() {
  const [highRisk, overdueInvoices, securityCritical, pendingLeaves, delayedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { riskScore: { gte: 2.5 } },
      take: 10, orderBy: { riskScore: 'desc' },
      select: { projectCode: true, name: true, riskScore: true, status: true },
    }),
    prisma.invoice.findMany({
      where: { status: 'OVERDUE' },
      take: 10, orderBy: { dueDate: 'asc' },
      include: { client: { select: { companyName: true } } },
    }),
    prisma.securityEvent.findMany({
      where: { status: 'OPEN', severity: 'CRITICAL' },
      take: 10, orderBy: { createdAt: 'desc' },
      select: { eventCode: true, title: true, severity: true, createdAt: true },
    }),
    prisma.leave.findMany({
      where: { status: 'PENDING' },
      take: 10, orderBy: { startDate: 'asc' },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    }),
    prisma.project.findMany({
      where: { status: 'ON_HOLD' },
      take: 10,
      select: { projectCode: true, name: true, progressPercent: true },
    }),
  ]);
  return {
    highRiskProjects: highRisk.map((p) => ({ code: p.projectCode, name: p.name, risk: Number(p.riskScore).toFixed(2), status: p.status })),
    overdueInvoices: overdueInvoices.map((i) => ({ number: i.invoiceNumber, client: i.client.companyName, total: Number(i.total), dueDate: i.dueDate })),
    criticalSecurity: securityCritical.map((s) => ({ code: s.eventCode, title: s.title, createdAt: s.createdAt })),
    pendingLeaves: pendingLeaves.map((l) => ({ employee: l.employee.fullName, code: l.employee.employeeCode, from: l.startDate, to: l.endDate })),
    delayedProjects: delayedProjects.map((p) => ({ code: p.projectCode, name: p.name, progress: p.progressPercent })),
  };
}
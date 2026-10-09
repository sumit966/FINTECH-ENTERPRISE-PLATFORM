import { prisma } from '../config/prisma';

// Fixed August revenue override (business requirement: Rs 8.2 Cr).
const AUGUST_REVENUE_OVERRIDE = 82000000;

export interface PulseOverview {
  headcount: number;
  activeProjects: number;
  totalProjects: number;
  revenueYtd: number;
  activeClients: number;
  openAlerts: number;
  payrollSpendYtd: number;
  openInvoices: number;
  overdueInvoices: number;
  avgProjectHealth: number;
  highRiskProjects: number;
  openSecurityEvents: number;
}

export async function getOverview(): Promise<PulseOverview> {
  const [
    headcount,
    activeProjects,
    totalProjects,
    activeClients,
    openAlerts,
    openInvoices,
    overdueInvoices,
    openSecurityEvents,
    payrollAgg,
    invoiceAgg,
    projectAgg,
    riskAgg,
  ] = await Promise.all([
    prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.invoice.count({ where: { status: 'SENT' } }),
    prisma.invoice.count({ where: { status: 'OVERDUE' } }),
    prisma.securityEvent.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
    prisma.payroll.aggregate({
      _sum: { netSalary: true },
      where: { year: 2024, status: 'PAID' },
    }),
    prisma.invoice.aggregate({
      _sum: { paidAmount: true },
    }),
    prisma.project.aggregate({
      _avg: { healthScore: true },
    }),
    prisma.project.count({ where: { riskScore: { gte: 2.5 } } }),
  ]);

  return {
    headcount,
    activeProjects,
    totalProjects,
    revenueYtd: Number(invoiceAgg._sum.paidAmount || 0),
    activeClients,
    openAlerts,
    payrollSpendYtd: Number(payrollAgg._sum.netSalary || 0),
    openInvoices,
    overdueInvoices,
    avgProjectHealth: Number(projectAgg._avg.healthScore || 0),
    highRiskProjects: riskAgg,
    openSecurityEvents,
  };
}

export async function getHeadcountByLocation() {
  const rows = await prisma.location.findMany({
    select: {
      code: true,
      name: true,
      city: true,
      _count: { select: { employees: true } },
    },
  });
  return rows.map((r) => ({
    code: r.code,
    name: r.name,
    city: r.city,
    count: r._count.employees,
  }));
}

export async function getHeadcountByDepartment() {
  const rows = await prisma.department.findMany({
    where: { isActive: true },
    select: {
      code: true,
      name: true,
      category: true,
      _count: { select: { employees: true } },
    },
  });
  return rows
    .map((r) => ({ code: r.code, name: r.name, category: r.category, count: r._count.employees }))
    .sort((a, b) => b.count - a.count);
}

export async function getProjectsByStatus() {
  const rows = await prisma.project.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count._all }));
}

export async function getRecentProjects(limit = 10) {
  const projects = await prisma.project.findMany({
    take: limit,
    orderBy: { updatedAt: 'desc' },
    select: {
      projectCode: true,
      name: true,
      status: true,
      progressPercent: true,
      healthScore: true,
      riskScore: true,
      budget: true,
      revenue: true,
      client: { select: { companyName: true, country: true } },
    },
  });
  return projects.map((p) => ({
    projectCode: p.projectCode,
    name: p.name,
    status: p.status,
    progress: p.progressPercent,
    health: Number(p.healthScore || 0),
    risk: Number(p.riskScore || 0),
    budget: Number(p.budget),
    revenue: Number(p.revenue),
    clientName: p.client.companyName,
    clientCountry: p.client.country,
  }));
}

export async function getTopClientsByRevenue(limit = 5) {
  const clients = await prisma.client.findMany({
    take: limit,
    orderBy: { revenue: 'desc' },
    select: {
      clientCode: true,
      companyName: true,
      country: true,
      industry: true,
      revenue: true,
      slaTier: true,
      _count: { select: { projects: true } },
    },
  });
  return clients.map((c) => ({
    clientCode: c.clientCode,
    companyName: c.companyName,
    country: c.country,
    industry: c.industry,
    revenue: Number(c.revenue),
    slaTier: c.slaTier,
    projectCount: c._count.projects,
  }));
}

export async function getRecentAlerts(limit = 8) {
  const rows = await prisma.securityEvent.findMany({
    where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      eventCode: true,
      title: true,
      severity: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    code: r.eventCode,
    title: r.title,
    severity: r.severity,
    category: r.category,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export async function getPayrollTrend(months = 6) {
  // Last N months of total paid payroll (net salary).
  const rows = await prisma.payroll.groupBy({
    by: ['year', 'month'],
    _sum: { netSalary: true, grossSalary: true },
    where: { status: 'PAID' },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: months,
  });
  return rows
    .map((r) => ({
      year: r.year,
      month: r.month,
      label: r.year + '-' + String(r.month).padStart(2, '0'),
      net: Number(r._sum.netSalary || 0),
      gross: Number(r._sum.grossSalary || 0),
    }))
    .reverse();
}
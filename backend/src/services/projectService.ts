import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getReferenceForIndustry } from './referenceProjects';
import { paginated } from '../utils/apiResponse';

export interface ListProjectsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  industry?: string;
  clientCode?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function listProjects(params: ListProjectsParams) {
  const { page, pageSize, search, status, industry, clientCode, sortBy, sortDir } = params;

  const where: Prisma.ProjectWhereInput = {};
  if (status) where.status = status as any;
  if (industry) where.industry = industry;
  if (clientCode) where.client = { clientCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { projectCode: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { client: { companyName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const allowedSort: Record<string, any> = {
    projectCode: 'projectCode',
    name: 'name',
    startDate: 'startDate',
    expectedEndDate: 'expectedEndDate',
    budget: 'budget',
    progressPercent: 'progressPercent',
    healthScore: 'healthScore',
    riskScore: 'riskScore',
  };
  const orderByField = allowedSort[sortBy || 'projectCode'] || 'projectCode';
  const orderByDir = sortDir === 'desc' ? 'desc' : 'asc';

  const [total, rows] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderByField]: orderByDir },
      include: {
        client: { select: { clientCode: true, companyName: true, country: true, industry: true, slaTier: true } },
        projectManager: { select: { employeeCode: true, fullName: true } },
        team: { select: { code: true, name: true } },
        _count: { select: { members: true, tasks: true, milestones: true, risks: true, invoices: true } },
      },
    }),
  ]);

  const items = rows.map((p) => ({
    id: p.id,
    projectCode: p.projectCode,
    projectType: p.projectType,
    name: p.name,
    clientCode: p.client.clientCode,
    clientName: p.client.companyName,
    clientCountry: p.client.country,
    clientIndustry: p.client.industry,
    slaTier: p.client.slaTier,
    industry: p.industry,
    country: p.country,
    status: p.status,
    progressPercent: p.progressPercent,
    budget: Number(p.budget),
    revenue: Number(p.revenue),
    cost: Number(p.cost),
    profit: Number(p.profit),
    startDate: p.startDate,
    expectedEndDate: p.expectedEndDate,
    actualEndDate: p.actualEndDate,
    healthScore: p.healthScore ? Number(p.healthScore) : null,
    riskScore: p.riskScore ? Number(p.riskScore) : null,
    securityStatus: p.securityStatus,
    qaStatus: p.qaStatus,
    techFrontend: p.techFrontend,
    techBackend: p.techBackend,
    techCloud: p.techCloud,
    projectManagerName: p.projectManager?.fullName || null,
    teamName: p.team?.name || null,
    memberCount: p._count.members,
    taskCount: p._count.tasks,
    milestoneCount: p._count.milestones,
    riskCount: p._count.risks,
    invoiceCount: p._count.invoices,
  }));

  return paginated(items, page, pageSize, total);
}

export async function getProjectDetail(projectCode: string) {
  const p = await prisma.project.findUnique({
    where: { projectCode },
    include: {
      client: true,
      location: true,
      team: true,
      projectManager: { select: { id: true, employeeCode: true, fullName: true, email: true } },
      members: {
        include: {
          employee: { select: { id: true, employeeCode: true, fullName: true, email: true } },
        },
        orderBy: { role: 'asc' },
      },
      tasks: { orderBy: { taskCode: 'asc' }, take: 50 },
      milestones: { orderBy: { dueDate: 'asc' } },
      risks: { orderBy: { severity: 'asc' } },
      invoices: { orderBy: { issueDate: 'desc' } },
      repositories: true,
      deployments: { orderBy: { deployedAt: 'desc' }, take: 10 },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    projectCode: p.projectCode,
    name: p.name,
    industry: p.industry,
    country: p.country,
    status: p.status,
    progressPercent: p.progressPercent,
    startDate: p.startDate,
    expectedEndDate: p.expectedEndDate,
    actualEndDate: p.actualEndDate,
    budget: Number(p.budget),
    revenue: Number(p.revenue),
    cost: Number(p.cost),
    profit: Number(p.profit),
    healthScore: p.healthScore ? Number(p.healthScore) : null,
    riskScore: p.riskScore ? Number(p.riskScore) : null,
    securityStatus: p.securityStatus,
    qaStatus: p.qaStatus,
    environment: p.environment,
    repository: p.repository,
    techFrontend: p.techFrontend,
    techBackend: p.techBackend,
    techDatabase: p.techDatabase,
    techCloud: p.techCloud,
    techAI: p.techAI,
    integrations: p.integrations,
    apiStyle: p.apiStyle,
    client: {
      id: p.client.id,
      clientCode: p.client.clientCode,
      companyName: p.client.companyName,
      country: p.client.country,
      industry: p.client.industry,
      slaTier: p.client.slaTier,
      healthScore: p.client.healthScore ? Number(p.client.healthScore) : null,
    },
    location: p.location ? { code: p.location.code, city: p.location.city } : null,
    team: p.team ? { code: p.team.code, name: p.team.name } : null,
    projectManager: p.projectManager
      ? { id: p.projectManager.id, employeeCode: p.projectManager.employeeCode, fullName: p.projectManager.fullName, email: p.projectManager.email }
      : null,
    members: p.members.map((m) => ({
      id: m.id,
      employeeId: m.employee.id,
      employeeCode: m.employee.employeeCode,
      fullName: m.employee.fullName,
      email: m.employee.email,
      role: m.role,
      allocation: m.allocation,
    })),
    tasks: p.tasks.map((t) => ({
      id: t.id,
      taskCode: t.taskCode,
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimateHrs: t.estimateHrs ? Number(t.estimateHrs) : null,
      spentHrs: t.spentHrs ? Number(t.spentHrs) : null,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
    })),
    milestones: p.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate,
      completedAt: m.completedAt,
      status: m.status,
    })),
    risks: p.risks.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      severity: r.severity,
      probability: r.probability ? Number(r.probability) : null,
      impact: r.impact ? Number(r.impact) : null,
      mitigation: r.mitigation,
      status: r.status,
    })),
    invoices: p.invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      total: Number(i.total),
      currency: i.currency,
      status: i.status,
      paidAmount: Number(i.paidAmount),
    })),
    reference: getReferenceForIndustry(p.industry),
    repositories: p.repositories.map((r) => ({
      id: r.id,
      repoCode: r.repoCode,
      name: r.name,
      url: r.url,
      language: r.language,
    })),
    deployments: p.deployments.map((d) => ({
      id: d.id,
      deploymentCode: d.deploymentCode,
      environment: d.environment,
      version: d.version,
      status: d.status,
      deployedAt: d.deployedAt,
    })),
  };
}

export async function getProjectsSummary() {
  const [total, statusBreakdown, industryBreakdown, financials, byClient] = await Promise.all([
    prisma.project.count(),
    prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.project.groupBy({ by: ['industry'], _count: { _all: true } }),
    prisma.project.aggregate({
      _sum: { budget: true, revenue: true, cost: true, profit: true },
      _avg: { healthScore: true, riskScore: true, progressPercent: true },
    }),
    prisma.client.findMany({
      select: { clientCode: true, companyName: true, _count: { select: { projects: true } } },
      orderBy: { projects: { _count: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    total,
    byStatus: statusBreakdown.map((s) => ({ status: s.status, count: s._count._all })),
    byIndustry: industryBreakdown.map((i) => ({ industry: i.industry, count: i._count._all })).sort((a, b) => b.count - a.count),
    totalBudget: Number(financials._sum.budget || 0),
    totalRevenue: Number(financials._sum.revenue || 0),
    totalCost: Number(financials._sum.cost || 0),
    totalProfit: Number(financials._sum.profit || 0),
    avgHealth: Number(financials._avg.healthScore || 0),
    avgRisk: Number(financials._avg.riskScore || 0),
    avgProgress: Number(financials._avg.progressPercent || 0),
    topClients: byClient.map((c) => ({
      clientCode: c.clientCode,
      companyName: c.companyName,
      projectCount: c._count.projects,
    })),
  };
}
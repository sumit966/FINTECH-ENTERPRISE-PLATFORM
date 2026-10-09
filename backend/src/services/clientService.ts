import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  country?: string;
  industry?: string;
  status?: string;
  slaTier?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function listClients(params: ListClientsParams) {
  const { page, pageSize, search, country, industry, status, slaTier, sortBy, sortDir } = params;

  const where: Prisma.ClientWhereInput = {};
  if (country) where.country = country;
  if (industry) where.industry = industry;
  if (status) where.status = status as any;
  if (slaTier) where.slaTier = slaTier;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { clientCode: { contains: q, mode: 'insensitive' } },
      { companyName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const allowedSort: Record<string, any> = {
    clientCode: 'clientCode',
    companyName: 'companyName',
    revenue: 'revenue',
    contractValue: 'contractValue',
    healthScore: 'healthScore',
  };
  const orderByField = allowedSort[sortBy || 'revenue'] || 'revenue';
  const orderByDir = sortDir === 'asc' ? 'asc' : 'desc';

  const [total, rows] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderByField]: orderByDir },
      include: {
        accountManager: { select: { employeeCode: true, fullName: true } },
        _count: { select: { projects: true, contacts: true, contracts: true, invoices: true } },
      },
    }),
  ]);

  const items = rows.map((c) => ({
    id: c.id,
    clientCode: c.clientCode,
    companyName: c.companyName,
    country: c.country,
    industry: c.industry,
    billingTerms: c.billingTerms,
    slaTier: c.slaTier,
    contractValue: Number(c.contractValue),
    revenue: Number(c.revenue),
    healthScore: c.healthScore ? Number(c.healthScore) : null,
    status: c.status,
    accountManagerName: c.accountManager?.fullName || null,
    projectCount: c._count.projects,
    contactCount: c._count.contacts,
    contractCount: c._count.contracts,
    invoiceCount: c._count.invoices,
  }));

  return paginated(items, page, pageSize, total);
}

export async function getClientDetail(clientCode: string) {
  const c = await prisma.client.findUnique({
    where: { clientCode },
    include: {
      accountManager: { select: { id: true, employeeCode: true, fullName: true, email: true } },
      contacts: { orderBy: { isPrimary: 'desc' } },
      contracts: { orderBy: { startDate: 'desc' } },
      projects: {
        select: {
          id: true,
          projectCode: true,
          name: true,
          status: true,
          progressPercent: true,
          budget: true,
          revenue: true,
          healthScore: true,
        },
        orderBy: { startDate: 'desc' },
      },
      invoices: {
        orderBy: { issueDate: 'desc' },
        take: 20,
      },
    },
  });
  if (!c) return null;

  const invoiceAgg = await prisma.invoice.aggregate({
    where: { clientId: c.id },
    _sum: { total: true, paidAmount: true },
    _count: { _all: true },
  });

  return {
    id: c.id,
    clientCode: c.clientCode,
    companyName: c.companyName,
    country: c.country,
    industry: c.industry,
    billingTerms: c.billingTerms,
    slaTier: c.slaTier,
    contractValue: Number(c.contractValue),
    revenue: Number(c.revenue),
    healthScore: c.healthScore ? Number(c.healthScore) : null,
    status: c.status,
    accountManager: c.accountManager
      ? { id: c.accountManager.id, employeeCode: c.accountManager.employeeCode, fullName: c.accountManager.fullName, email: c.accountManager.email }
      : null,
    contacts: c.contacts.map((k) => ({
      id: k.id,
      fullName: k.fullName,
      title: k.title,
      email: k.email,
      phone: k.phone,
      isPrimary: k.isPrimary,
    })),
    contracts: c.contracts.map((k) => ({
      id: k.id,
      contractCode: k.contractCode,
      title: k.title,
      startDate: k.startDate,
      endDate: k.endDate,
      value: Number(k.value),
      currency: k.currency,
      status: k.status,
    })),
    projects: c.projects.map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      name: p.name,
      status: p.status,
      progressPercent: p.progressPercent,
      budget: Number(p.budget),
      revenue: Number(p.revenue),
      healthScore: p.healthScore ? Number(p.healthScore) : null,
    })),
    invoices: c.invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      total: Number(i.total),
      paidAmount: Number(i.paidAmount),
      currency: i.currency,
      status: i.status,
    })),
    invoiceTotals: {
      totalInvoiced: Number(invoiceAgg._sum.total || 0),
      totalPaid: Number(invoiceAgg._sum.paidAmount || 0),
      invoiceCount: invoiceAgg._count._all,
    },
  };
}

export async function getClientsSummary() {
  const [total, byCountry, byIndustry, byStatus, bySla, revenueAgg, topClients] = await Promise.all([
    prisma.client.count(),
    prisma.client.groupBy({ by: ['country'], _count: { _all: true } }),
    prisma.client.groupBy({ by: ['industry'], _count: { _all: true } }),
    prisma.client.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.client.groupBy({ by: ['slaTier'], _count: { _all: true } }),
    prisma.client.aggregate({ _sum: { revenue: true, contractValue: true } }),
    prisma.client.findMany({
      select: { clientCode: true, companyName: true, country: true, industry: true, revenue: true, slaTier: true },
      orderBy: { revenue: 'desc' },
      take: 10,
    }),
  ]);

  return {
    total,
    byCountry: byCountry.map((c) => ({ country: c.country, count: c._count._all })).sort((a, b) => b.count - a.count),
    byIndustry: byIndustry.map((i) => ({ industry: i.industry, count: i._count._all })).sort((a, b) => b.count - a.count),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    bySlaTier: bySla.map((s) => ({ tier: s.slaTier, count: s._count._all })),
    totalRevenue: Number(revenueAgg._sum.revenue || 0),
    totalContractValue: Number(revenueAgg._sum.contractValue || 0),
    topClients: topClients.map((c) => ({
      clientCode: c.clientCode,
      companyName: c.companyName,
      country: c.country,
      industry: c.industry,
      revenue: Number(c.revenue),
      slaTier: c.slaTier,
    })),
  };
}
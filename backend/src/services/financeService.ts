import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

// ---------- Invoices ----------
export interface ListInvoicesParams {
  page: number; pageSize: number;
  status?: string; currency?: string; clientCode?: string;
  search?: string; year?: number;
}

export async function listInvoices(params: ListInvoicesParams) {
  const { page, pageSize, status, currency, clientCode, search, year } = params;
  const where: Prisma.InvoiceWhereInput = {};
  if (status) where.status = status as any;
  if (currency) where.currency = currency;
  if (clientCode) where.client = { clientCode };
  if (year) {
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year + 1, 0, 1));
    where.issueDate = { gte: from, lt: to };
  }
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: 'insensitive' } },
      { client: { companyName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: [{ issueDate: 'desc' }],
      include: {
        client: { select: { clientCode: true, companyName: true, country: true } },
        project: { select: { projectCode: true, name: true } },
      },
    }),
  ]);

  const items = rows.map((i) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    clientCode: i.client.clientCode,
    clientName: i.client.companyName,
    clientCountry: i.client.country,
    projectCode: i.project?.projectCode || null,
    projectName: i.project?.name || null,
    issueDate: i.issueDate,
    dueDate: i.dueDate,
    paidDate: i.paidDate,
    subtotal: Number(i.subtotal),
    taxAmount: Number(i.taxAmount),
    total: Number(i.total),
    paidAmount: Number(i.paidAmount),
    currency: i.currency,
    status: i.status,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Expenses ----------
export interface ListExpensesParams {
  page: number; pageSize: number;
  category?: string; status?: string; search?: string;
}

export async function listExpenses(params: ListExpensesParams) {
  const { page, pageSize, category, status, search } = params;
  const where: Prisma.ExpenseWhereInput = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { expenseCode: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: [{ incurredAt: 'desc' }],
    }),
  ]);

  const items = rows.map((e) => ({
    id: e.id,
    expenseCode: e.expenseCode,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    currency: e.currency,
    incurredAt: e.incurredAt,
    status: e.status,
    receiptUrl: e.receiptUrl,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Summary ----------
export async function getFinanceSummary() {
  const now = new Date();
  const ytdFrom = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const [
    invoiceTotals, paidTotals, overdueTotals,
    expenseTotals, expenseMtd,
    projectPnl,
  ] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { total: true, taxAmount: true, subtotal: true }, _count: { _all: true } }),
    prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { status: 'PAID' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, _count: { _all: true }, where: { status: 'OVERDUE' } }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { incurredAt: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)) } },
    }),
    prisma.project.aggregate({
      _sum: { revenue: true, cost: true, profit: true, budget: true },
    }),
  ]);

  // Ageing buckets from unpaid invoices
  const unpaid = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'OVERDUE'] } },
    select: { dueDate: true, total: true },
  });
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  for (const inv of unpaid) {
    const days = Math.floor((now.getTime() - inv.dueDate.getTime()) / (24 * 3600 * 1000));
    const amt = Number(inv.total);
    if (days <= 0) buckets.current += amt;
    else if (days <= 30) buckets.d30 += amt;
    else if (days <= 60) buckets.d60 += amt;
    else if (days <= 90) buckets.d90 += amt;
    else buckets.d90plus += amt;
  }

  return {
    totalInvoiced: Number(invoiceTotals._sum.total || 0),
    totalSubtotal: Number(invoiceTotals._sum.subtotal || 0),
    totalTax: Number(invoiceTotals._sum.taxAmount || 0),
    totalInvoiceCount: invoiceTotals._count._all,
    totalPaid: Number(paidTotals._sum.paidAmount || 0),
    outstanding: Number(invoiceTotals._sum.total || 0) - Number(paidTotals._sum.paidAmount || 0),
    overdueAmount: Number(overdueTotals._sum.total || 0),
    overdueCount: overdueTotals._count._all,
    totalExpenses: Number(expenseTotals._sum.amount || 0),
    totalExpenseCount: expenseTotals._count._all,
    expensesMtd: Number(expenseMtd._sum.amount || 0),
    projectRevenue: Number(projectPnl._sum.revenue || 0),
    projectCost: Number(projectPnl._sum.cost || 0),
    projectProfit: Number(projectPnl._sum.profit || 0),
    projectBudget: Number(projectPnl._sum.budget || 0),
    profitMargin: Number(projectPnl._sum.revenue || 0) > 0
      ? (Number(projectPnl._sum.profit || 0) / Number(projectPnl._sum.revenue || 0)) * 100
      : 0,
    ageing: buckets,
  };
}

export async function getRevenueVsExpenses(months = 12) {
  const now = new Date();
  const points: { label: string; revenue: number; expenses: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const from = d;
    const to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    const [rev, exp] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { paidAmount: true },
        where: { paidDate: { gte: from, lt: to } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { incurredAt: { gte: from, lt: to } },
      }),
    ]);
    points.push({
      label: d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'),
      revenue: Number(rev._sum.paidAmount || 0),
      expenses: Number(exp._sum.amount || 0),
    });
  }
  return points;
}

export async function getExpenseBreakdown() {
  const rows = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    _count: { _all: true },
  });
  return rows
    .map((r) => ({ category: r.category, total: Number(r._sum.amount || 0), count: r._count._all }))
    .sort((a, b) => b.total - a.total);
}

export async function getTopClientsByRevenue(limit = 10) {
  const rows = await prisma.client.findMany({
    take: limit,
    orderBy: { revenue: 'desc' },
    select: { clientCode: true, companyName: true, country: true, industry: true, revenue: true },
  });
  return rows.map((r) => ({ ...r, revenue: Number(r.revenue) }));
}
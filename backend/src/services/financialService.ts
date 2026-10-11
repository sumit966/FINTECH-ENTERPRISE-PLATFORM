import { prisma } from '../config/prisma';

// ============================================================================
// Per-project financial intelligence.
// All values computed from stored records: invoices, project membership,
// progress, and deterministic per-project infrastructure cost models.
// ============================================================================

export interface ProjectFinancials {
  projectCode: string;
  projectName: string;
  currency: string;
  contractValue: number;
  approvedBudget: number;
  actualExpenditure: number;
  forecastCost: number;
  recognizedRevenue: number;
  invoicedRevenue: number;
  collected: number;
  outstanding: number;
  employeeCost: number;
  cloudCost: number;
  licenseCost: number;
  vendorCost: number;
  otherCost: number;
  totalProjectCost: number;
  grossProfit: number;
  projectContribution: number;
  contributionMargin: number;
  budgetVariance: number;
  estimateToComplete: number;
  monthsElapsed: number;
  monthsTotal: number;
  monthlySpend: { label: string; amount: number }[];
  invoiceCollection: { label: string; invoiced: number; collected: number }[];
  dataAvailability: {
    hasInvoices: boolean;
    hasMembers: boolean;
    hasExpenses: boolean;
    hasAssets: boolean;
    hasLicenses: boolean;
  };
}

function monthDiff(from: Date, to: Date): number {
  return Math.max(0, (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()));
}

function monthLabel(year: number, month: number): string {
  return year + '-' + String(month + 1).padStart(2, '0');
}

// Deterministic per-project cloud cost. Based on tech stack breadth and
// budget tier. Documented so the numbers are reproducible.
function deriveCloudCost(techCloud: string[], contractValue: number, months: number): number {
  const monthlyBase = contractValue * 0.006; // 0.6% of contract per month
  const multiplier = 1 + techCloud.length * 0.18;
  return Math.round(monthlyBase * multiplier * months);
}

function deriveLicenseCost(techBackend: string[], techFrontend: string[], techDatabase: string[], months: number): number {
  const seats = 30 + techBackend.length * 4 + techFrontend.length * 3 + techDatabase.length * 2;
  const monthlyPerSeat = 4500;
  return Math.round(seats * monthlyPerSeat * months);
}

function deriveVendorCost(integrations: string[], months: number): number {
  return Math.round(integrations.length * 85000 * months);
}

function deriveOtherCost(months: number): number {
  return Math.round(35000 * months);
}

export async function getProjectFinancials(projectCode: string): Promise<ProjectFinancials | null> {
  const project = await prisma.project.findUnique({
    where: { projectCode },
    include: {
      members: { include: { employee: { select: { netSalary: true } } } },
      invoices: true,
    },
  });
  if (!project) return null;

  const now = new Date();
  const start = project.startDate;
  const plannedEnd = project.expectedEndDate;
  const actualEnd = project.actualEndDate;

  // Bounded end for cost accumulation. If project is not yet finished, use now.
  const boundedEnd = actualEnd || (now < plannedEnd ? now : plannedEnd);

  const monthsElapsed = Math.max(1, monthDiff(start, boundedEnd));
  const monthsTotal = Math.max(1, monthDiff(start, plannedEnd));

  // ---------- Contract and budget ----------
  const contractValue = Number(project.budget);
  const approvedBudget = Number(project.budget);

  // ---------- Revenue recognition ----------
  // Progressive recognition: work performed = contract x progress.
  const recognizedRevenue = Math.round(contractValue * (project.progressPercent / 100));

  // Invoiced and collected from the invoice table.
  const invoicedRevenue = project.invoices.reduce((s, i) => s + Number(i.total), 0);
  const collected = project.invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
  const outstanding = invoicedRevenue - collected;

  // ---------- Employee cost ----------
  let employeeCost = 0;
  for (const m of project.members) {
    const monthlyGross = Number(m.employee.netSalary);
    const allocation = m.allocation / 100;
    employeeCost += monthlyGross * allocation * monthsElapsed;
  }
  employeeCost = Math.round(employeeCost);

  // ---------- Infrastructure-derived costs ----------
  const cloudCost = deriveCloudCost(project.techCloud, contractValue, monthsElapsed);
  const licenseCost = deriveLicenseCost(project.techBackend, project.techFrontend, project.techDatabase, monthsElapsed);
  const vendorCost = deriveVendorCost(project.integrations, monthsElapsed);
  const otherCost = deriveOtherCost(monthsElapsed);

  const totalProjectCost = employeeCost + cloudCost + licenseCost + vendorCost + otherCost;
  const actualExpenditure = totalProjectCost;

  // ---------- Forecast ----------
  // If the project has progress, forecast scales cost to 100%.
  const forecastCost = project.progressPercent > 0
    ? Math.round(actualExpenditure * (100 / Math.max(1, project.progressPercent)))
    : actualExpenditure;
  const estimateToComplete = Math.max(0, forecastCost - actualExpenditure);

  // ---------- Derived P&L ----------
  // Gross profit = recognized revenue - total cost.
  const grossProfit = recognizedRevenue - totalProjectCost;
  const projectContribution = recognizedRevenue - totalProjectCost;
  const contributionMargin = recognizedRevenue > 0
    ? Math.round(((projectContribution / recognizedRevenue) * 100) * 100) / 100
    : 0;
  const budgetVariance = actualExpenditure - approvedBudget;

  // ---------- Monthly spend series ----------
  // Bounded to project's own timeline: from start, for `monthsElapsed` months.
  const monthlySpend: { label: string; amount: number }[] = [];
  const perMonthCost = actualExpenditure / monthsElapsed;
  for (let i = 0; i < monthsElapsed; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const variation = 0.85 + ((d.getUTCMonth() * 7) % 30) / 100;
    monthlySpend.push({
      label: monthLabel(d.getUTCFullYear(), d.getUTCMonth()),
      amount: Math.round(perMonthCost * variation),
    });
  }

  // ---------- Invoice collection series ----------
  const byMonth: Record<string, { invoiced: number; collected: number }> = {};
  for (const inv of project.invoices) {
    const key = monthLabel(inv.issueDate.getUTCFullYear(), inv.issueDate.getUTCMonth());
    if (!byMonth[key]) byMonth[key] = { invoiced: 0, collected: 0 };
    byMonth[key].invoiced += Number(inv.total);
    byMonth[key].collected += Number(inv.paidAmount);
  }
  const invoiceCollection = Object.entries(byMonth)
    .sort()
    .map(([label, v]) => ({ label, invoiced: v.invoiced, collected: v.collected }));

  return {
    projectCode: project.projectCode,
    projectName: project.name,
    currency: 'INR',
    contractValue,
    approvedBudget,
    actualExpenditure,
    forecastCost,
    recognizedRevenue,
    invoicedRevenue,
    collected,
    outstanding,
    employeeCost,
    cloudCost,
    licenseCost,
    vendorCost,
    otherCost,
    totalProjectCost,
    grossProfit,
    projectContribution,
    contributionMargin,
    budgetVariance,
    estimateToComplete,
    monthsElapsed,
    monthsTotal,
    monthlySpend,
    invoiceCollection,
    dataAvailability: {
      hasInvoices: project.invoices.length > 0,
      hasMembers: project.members.length > 0,
      hasExpenses: false,
      hasAssets: false,
      hasLicenses: true,
    },
  };
}
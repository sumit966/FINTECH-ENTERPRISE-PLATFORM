import { prisma } from '../config/prisma';
import { env } from '../config/env';

export interface AiAnswer {
  question: string;
  answer: string;
  rows?: Record<string, any>[];
  kind: 'text' | 'table';
  provider: string;
}

export interface AiContext {
  userEmail: string;
  roles: string[];
  permissions: string[];
}

// ---- Rule-based engine ---------------------------------------------------
// Parses a natural-language question into a deterministic Prisma query.
// Every query is scoped by the caller's permissions before executing.

const SUPER_ROLES = new Set(['FOUNDER_CEO', 'DIRECTOR']);

function hasPermission(ctx: AiContext, code: string): boolean {
  if (ctx.roles.some((r) => SUPER_ROLES.has(r))) return true;
  return ctx.permissions.includes(code);
}

function deny(subject: string): AiAnswer {
  return {
    question: '',
    answer: 'You do not have permission to view ' + subject + '.',
    kind: 'text',
    provider: 'rbac',
  };
}

// Location name → code mapping
const LOCATION_ALIASES: Record<string, string> = {
  pune: 'PUNE', bangalore: 'BLR', bengaluru: 'BLR', noida: 'NOIDA',
};

// Department keywords → code
const DEPT_ALIASES: Record<string, string> = {
  'backend': 'BE', 'frontend': 'FE', 'full stack': 'FS', 'fullstack': 'FS',
  'mobile': 'MOB', 'ai': 'AIML', 'ml': 'AIML', 'machine learning': 'AIML',
  'data': 'DATA', 'cloud': 'CLOUD', 'devops': 'DEVOPS', 'sre': 'SRE',
  'security': 'SEC', 'qa': 'QA', 'quality': 'QA', 'design': 'UX', 'ux': 'UX',
  'architecture': 'ARCH', 'support': 'SUP', 'product': 'PM', 'sales': 'SALES',
  'hr': 'HR', 'finance': 'FIN',
};

function extractLocation(q: string): string | null {
  for (const [k, v] of Object.entries(LOCATION_ALIASES)) {
    if (q.includes(k)) return v;
  }
  return null;
}
function extractDepartment(q: string): string | null {
  for (const [k, v] of Object.entries(DEPT_ALIASES)) {
    if (q.includes(k)) return v;
  }
  return null;
}
function extractProjectCode(q: string): string | null {
  const m = q.match(/prj-?\d{3}/i);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, '');
  return 'PRJ-' + digits.padStart(3, '0');
}

async function answerEmployeesByLocationOrDept(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'employees.read')) return deny('employees');
  const locationCode = extractLocation(q);
  const deptCode = extractDepartment(q);

  const where: any = { employmentStatus: 'ACTIVE' };
  if (locationCode) where.location = { code: locationCode };
  if (deptCode) where.department = { code: deptCode };

  const rows = await prisma.employee.findMany({
    where,
    take: 25,
    select: {
      employeeCode: true, fullName: true, email: true,
      location: { select: { city: true } },
      department: { select: { name: true } },
      salaryGrade: true,
      manager: { select: { fullName: true } },
    },
  });

  const total = await prisma.employee.count({ where });
  const parts: string[] = [];
  if (locationCode) parts.push('in ' + Object.entries(LOCATION_ALIASES).find(([, v]) => v === locationCode)?.[0]);
  if (deptCode) parts.push('in ' + deptCode);

  return {
    question: q,
    answer: 'Found ' + total + ' active employee' + (total === 1 ? '' : 's') + ' ' + parts.join(' ') + '.',
    rows: rows.map((r) => ({
      code: r.employeeCode,
      name: r.fullName,
      location: r.location.city,
      department: r.department.name,
      grade: r.salaryGrade,
      manager: r.manager?.fullName || '—',
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerDelayedProjects(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'projects.read')) return deny('projects');
  const rows = await prisma.project.findMany({
    where: { status: { in: ['ON_HOLD', 'PLANNING', 'PENDING'] }, expectedEndDate: { lt: new Date() } },
    take: 25,
    include: { client: { select: { companyName: true } } },
  });
  return {
    question: q,
    answer: rows.length === 0 ? 'No projects are currently delayed.' : 'Found ' + rows.length + ' delayed or at-risk projects.',
    rows: rows.map((p) => ({
      code: p.projectCode,
      name: p.name,
      client: p.client.companyName,
      status: p.status,
      expectedEnd: p.expectedEndDate.toISOString().slice(0, 10),
      risk: p.riskScore ? Number(p.riskScore).toFixed(2) : '—',
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerProjectMembers(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'projects.read')) return deny('projects');
  const code = extractProjectCode(q);
  if (!code) {
    return { question: q, answer: 'Please include a project code, like PRJ-021.', kind: 'text', provider: 'rule-based' };
  }
  const project = await prisma.project.findUnique({
    where: { projectCode: code },
    include: {
      members: {
        include: { employee: { select: { employeeCode: true, fullName: true, email: true } } },
      },
    },
  });
  if (!project) return { question: q, answer: 'Project ' + code + ' was not found.', kind: 'text', provider: 'rule-based' };
  return {
    question: q,
    answer: project.name + ' has ' + project.members.length + ' team members.',
    rows: project.members.map((m) => ({
      code: m.employee.employeeCode,
      name: m.employee.fullName,
      role: m.role,
      allocation: m.allocation + '%',
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerPayrollSummary(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'payroll.read')) return deny('payroll');
  const [total, sum] = await Promise.all([
    prisma.payroll.count({ where: { year: 2024 } }),
    prisma.payroll.aggregate({ _sum: { netSalary: true }, where: { year: 2024, status: 'PAID' } }),
  ]);
  const value = Number(sum._sum.netSalary || 0);
  return {
    question: q,
    answer: 'Payroll 2024: ' + total.toLocaleString('en-IN') + ' records, ₹' + (value / 10000000).toFixed(2) + ' Cr net paid.',
    kind: 'text',
    provider: 'rule-based',
  };
}

async function answerTopClients(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'clients.read')) return deny('clients');
  const rows = await prisma.client.findMany({
    take: 10,
    orderBy: { revenue: 'desc' },
    select: { clientCode: true, companyName: true, country: true, industry: true, revenue: true },
  });
  return {
    question: q,
    answer: 'Top ' + rows.length + ' clients by revenue.',
    rows: rows.map((c) => ({
      code: c.clientCode,
      client: c.companyName,
      country: c.country,
      industry: c.industry,
      revenue: '₹' + (Number(c.revenue) / 100000).toFixed(1) + 'L',
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerOverBudget(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'projects.read')) return deny('projects');
  const rows = await prisma.project.findMany({
    where: {},
    take: 30,
    orderBy: { cost: 'desc' },
    include: { client: { select: { companyName: true } } },
  });
  const over = rows.filter((p) => Number(p.cost) > Number(p.budget));
  return {
    question: q,
    answer: over.length + ' project' + (over.length === 1 ? '' : 's') + ' over budget.',
    rows: over.map((p) => ({
      code: p.projectCode,
      name: p.name,
      client: p.client.companyName,
      budget: '₹' + (Number(p.budget) / 100000).toFixed(1) + 'L',
      cost: '₹' + (Number(p.cost) / 100000).toFixed(1) + 'L',
      over: '₹' + ((Number(p.cost) - Number(p.budget)) / 100000).toFixed(1) + 'L',
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerHighRisk(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'projects.read')) return deny('projects');
  const rows = await prisma.project.findMany({
    where: { riskScore: { gte: 2.5 } },
    orderBy: { riskScore: 'desc' },
    take: 20,
    include: { client: { select: { companyName: true } } },
  });
  return {
    question: q,
    answer: rows.length + ' high-risk projects (risk score ≥ 2.5).',
    rows: rows.map((p) => ({
      code: p.projectCode,
      name: p.name,
      client: p.client.companyName,
      risk: Number(p.riskScore).toFixed(2),
      status: p.status,
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerSkills(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'employees.read')) return deny('employees');
  // Look for known skill names in the question
  const allSkills = await prisma.skill.findMany();
  const matches = allSkills.filter((s) => q.toLowerCase().includes(s.name.toLowerCase()));
  if (matches.length === 0) {
    return { question: q, answer: 'Mention a specific skill, like "AWS" or "React".', kind: 'text', provider: 'rule-based' };
  }
  const employees = await prisma.employee.findMany({
    where: { skills: { some: { skill: { name: { in: matches.map((m) => m.name) } } } } },
    take: 25,
    select: {
      employeeCode: true, fullName: true,
      department: { select: { name: true } },
      location: { select: { city: true } },
      skills: { include: { skill: { select: { name: true } } } },
    },
  });
  return {
    question: q,
    answer: employees.length + ' employees match skill' + (matches.length === 1 ? '' : 's') + ' ' + matches.map((m) => m.name).join(', ') + '.',
    rows: employees.map((e) => ({
      code: e.employeeCode,
      name: e.fullName,
      department: e.department.name,
      location: e.location.city,
      skills: e.skills.map((s) => s.skill.name).join(', '),
    })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerHeadcount(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'employees.read')) return deny('employees');
  const [total, byLocation] = await Promise.all([
    prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
    prisma.location.findMany({ select: { code: true, city: true, _count: { select: { employees: true } } } }),
  ]);
  return {
    question: q,
    answer: 'Total active headcount is ' + total + '.',
    rows: byLocation.map((l) => ({ location: l.city, count: l._count.employees })),
    kind: 'table',
    provider: 'rule-based',
  };
}

async function answerRevenue(ctx: AiContext, q: string): Promise<AiAnswer> {
  if (!hasPermission(ctx, 'finance.read')) return deny('finance');
  const [paid, invoiced] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { status: 'PAID' } }),
    prisma.invoice.aggregate({ _sum: { total: true } }),
  ]);
  return {
    question: q,
    answer: 'Revenue: ₹' + (Number(paid._sum.paidAmount || 0) / 10000000).toFixed(2) + ' Cr paid, ₹' +
            (Number(invoiced._sum.total || 0) / 10000000).toFixed(2) + ' Cr invoiced.',
    kind: 'text',
    provider: 'rule-based',
  };
}

async function answerWhoami(ctx: AiContext, q: string): Promise<AiAnswer> {
  return {
    question: q,
    answer: 'You are signed in as ' + ctx.userEmail + ' with roles: ' + ctx.roles.join(', ') + '. You have ' + ctx.permissions.length + ' permissions.',
    kind: 'text',
    provider: 'rule-based',
  };
}

// ---- Dispatcher ----------------------------------------------------------
export async function ask(qRaw: string, ctx: AiContext): Promise<AiAnswer> {
  const q = qRaw.toLowerCase().trim();

  if (!q) return { question: qRaw, answer: 'Ask a question, for example: "show backend engineers in Pune".', kind: 'text', provider: 'rule-based' };

  if (q.includes('who am i') || q.includes('whoami') || q.includes('my role')) return answerWhoami(ctx, qRaw);

  if (q.includes('revenue') || q.includes('sales') || q.includes('invoice')) return answerRevenue(ctx, qRaw);

  if (q.includes('headcount') || q.includes('how many employee')) return answerHeadcount(ctx, qRaw);

  if (q.includes('over budget') || q.includes('overbudget')) return answerOverBudget(ctx, qRaw);

  if (q.includes('high risk') || q.includes('at risk') || q.includes('risky')) return answerHighRisk(ctx, qRaw);

  if (q.includes('delayed') || q.includes('on hold') || q.includes('slipping')) return answerDelayedProjects(ctx, qRaw);

  if (q.includes('who is on') || q.includes('working on') || q.includes('team members') || q.includes('members of')) return answerProjectMembers(ctx, qRaw);

  if (q.includes('payroll') || q.includes('salary spend') || q.includes('net salary')) return answerPayrollSummary(ctx, qRaw);

  if (q.includes('top client') || q.includes('best client') || q.includes('highest revenue client')) return answerTopClients(ctx, qRaw);

  if (q.includes('skill') || q.includes('who knows') || q.includes('who has') || q.includes('with ') && (q.includes('aws') || q.includes('react') || q.includes('python') || q.includes('java') || q.includes('kubernetes'))) {
    return answerSkills(ctx, qRaw);
  }

  if (q.includes('engineer') || q.includes('developer') || q.includes('employee') || q.includes('staff') || q.includes('people') || q.includes('team')) {
    return answerEmployeesByLocationOrDept(ctx, qRaw);
  }

  return {
    question: qRaw,
    answer: 'I could not match your question to a known pattern. Try: "backend engineers in Pune", "which projects are delayed", "who is on PRJ-021", "top clients by revenue", "employees with AWS skill".',
    kind: 'text',
    provider: 'rule-based',
  };
}

export function currentProvider(): string {
  return env.aiProvider === 'openai' && env.aiApiKey ? 'openai' : 'rule-based';
}
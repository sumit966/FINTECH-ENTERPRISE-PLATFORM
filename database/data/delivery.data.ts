// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Project delivery graph
// ProjectMembers, ProjectTasks, ProjectMilestones, ProjectRisks, Invoices
// All derived from existing deterministic data. No randomness.
// ============================================================================

import { projectsData } from './projects.data';
import { clientsData } from './clients.data';
import { employeesData } from './employees.data';

export interface ProjectMemberData {
  projectCode: string;
  employeeCode: string;
  role: 'DEV' | 'QA' | 'LEAD' | 'PM' | 'ARCHITECT';
  allocation: number;
}

const ROLE_SEQUENCE: ProjectMemberData['role'][] = ['PM', 'LEAD', 'DEV', 'DEV', 'QA'];

export const projectMembersData: ProjectMemberData[] = [];

for (let p = 0; p < projectsData.length; p++) {
  for (let k = 0; k < ROLE_SEQUENCE.length; k++) {
    const empIndex = 12 + ((p * 5 + k * 17) % (employeesData.length - 12));
    const emp = employeesData[empIndex];
    projectMembersData.push({
      projectCode: projectsData[p].projectCode,
      employeeCode: emp.employeeCode,
      role: ROLE_SEQUENCE[k],
      allocation: k < 2 ? 100 : (k === 2 ? 80 : 60),
    });
  }
}

export interface ProjectTaskData {
  taskCode: string;
  projectCode: string;
  title: string;
  description: string;
  assigneeCode: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimateHrs: number;
  spentHrs: number;
  dueDate: Date;
  completedAt: Date | null;
}

const TASK_TEMPLATES = [
  { title: 'Requirement analysis',         desc: 'Confirm scope, acceptance criteria, and dependencies.' },
  { title: 'Implementation - core module', desc: 'Build the primary feature module and unit tests.' },
  { title: 'Integration and hardening',    desc: 'Wire integrations, run load tests, and fix defects.' },
];

const TASK_STATUS_CYCLE: ProjectTaskData['status'][] = ['DONE', 'IN_PROGRESS', 'TODO', 'IN_REVIEW'];
const TASK_PRIORITY_CYCLE: ProjectTaskData['priority'][] = ['MEDIUM', 'HIGH', 'CRITICAL', 'LOW'];

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 3600 * 1000);
}

export const projectTasksData: ProjectTaskData[] = [];

for (let p = 0; p < projectsData.length; p++) {
  const proj = projectsData[p];
  for (let t = 0; t < TASK_TEMPLATES.length; t++) {
    const tpl = TASK_TEMPLATES[t];
    const empIndex = 12 + ((p * 3 + t * 11) % (employeesData.length - 12));
    const emp = employeesData[empIndex];
    const status = (proj.status === 'DELIVERED' || proj.status === 'CLOSED' || proj.status === 'MAINTENANCE')
      ? 'DONE'
      : TASK_STATUS_CYCLE[(p + t) % TASK_STATUS_CYCLE.length];
    const priority = TASK_PRIORITY_CYCLE[(p + t) % TASK_PRIORITY_CYCLE.length];
    const estimate = 40 + ((p + t) * 17) % 120;
    const spent = status === 'DONE' ? estimate : Math.floor(estimate * 0.5);
    const due = addDays(proj.startDate, 30 * (t + 1));
    const completedAt = status === 'DONE' ? addDays(due, -2) : null;
    projectTasksData.push({
      taskCode: 'TSK-' + proj.projectCode.slice(-3) + '-' + (t + 1),
      projectCode: proj.projectCode,
      title: tpl.title,
      description: tpl.desc,
      assigneeCode: emp.employeeCode,
      status,
      priority,
      estimateHrs: estimate,
      spentHrs: spent,
      dueDate: due,
      completedAt,
    });
  }
}

export interface ProjectMilestoneData {
  projectCode: string;
  title: string;
  dueDate: Date;
  completedAt: Date | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

const MILESTONE_TITLES = ['Discovery complete', 'Design sign-off', 'MVP ready', 'Production release'];

export const projectMilestonesData: ProjectMilestoneData[] = [];

for (let p = 0; p < projectsData.length; p++) {
  const proj = projectsData[p];
  const totalDuration = proj.expectedEndDate.getTime() - proj.startDate.getTime();
  for (let m = 0; m < MILESTONE_TITLES.length; m++) {
    const dueOffset = Math.floor((totalDuration / MILESTONE_TITLES.length) * (m + 1));
    const due = new Date(proj.startDate.getTime() + dueOffset);
    let status: ProjectMilestoneData['status'];
    let completedAt: Date | null = null;
    if (proj.status === 'DELIVERED' || proj.status === 'CLOSED' || proj.status === 'MAINTENANCE') {
      status = 'COMPLETED';
      completedAt = new Date(due.getTime() - 2 * 24 * 3600 * 1000);
    } else if (proj.status === 'ON_HOLD') {
      status = m < 2 ? 'COMPLETED' : 'DELAYED';
      if (m < 2) completedAt = new Date(due.getTime() - 3 * 24 * 3600 * 1000);
    } else {
      const fraction = proj.progressPercent / 100;
      const threshold = (m + 1) / MILESTONE_TITLES.length;
      if (fraction >= threshold) { status = 'COMPLETED'; completedAt = new Date(due.getTime() - 2 * 24 * 3600 * 1000); }
      else if (fraction >= threshold - 0.25) { status = 'IN_PROGRESS'; }
      else { status = 'PENDING'; }
    }
    projectMilestonesData.push({
      projectCode: proj.projectCode,
      title: MILESTONE_TITLES[m],
      dueDate: due,
      completedAt,
      status,
    });
  }
}

export interface ProjectRiskData {
  projectCode: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  impact: number;
  mitigation: string;
  status: 'OPEN' | 'MITIGATED' | 'CLOSED';
}

function riskSeverityFor(riskScore: number): ProjectRiskData['severity'] {
  if (riskScore >= 3.0) return 'CRITICAL';
  if (riskScore >= 2.2) return 'HIGH';
  if (riskScore >= 1.6) return 'MEDIUM';
  return 'LOW';
}

export const projectRisksData: ProjectRiskData[] = [];

for (let p = 0; p < projectsData.length; p++) {
  const proj = projectsData[p];
  const severity = riskSeverityFor(proj.riskScore);
  projectRisksData.push({
    projectCode: proj.projectCode,
    title: 'Resource and schedule variance',
    description: 'Track critical path; escalate blockers within one business day.',
    severity,
    probability: Math.min(0.9, proj.riskScore / 4),
    impact: Math.min(1.0, proj.riskScore / 3),
    mitigation: 'Weekly steering committee; rebalance allocation if slippage exceeds 5%.',
    status: severity === 'LOW' ? 'CLOSED' : 'OPEN',
  });
}

export interface InvoiceData {
  invoiceNumber: string;
  clientCode: string;
  projectCode: string;
  issueDate: Date;
  dueDate: Date;
  paidDate: Date | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paidAmount: number;
}

function countryToCurrency(country: string): string {
  if (country === 'India') return 'INR';
  if (country === 'USA') return 'USD';
  if (country === 'UK') return 'GBP';
  if (country === 'Germany' || country === 'Ireland') return 'EUR';
  if (country === 'Singapore') return 'SGD';
  if (country === 'UAE') return 'AED';
  if (country === 'Australia') return 'AUD';
  if (country === 'Canada') return 'CAD';
  if (country === 'Switzerland') return 'CHF';
  return 'USD';
}

export const invoicesData: InvoiceData[] = [];

for (let p = 0; p < projectsData.length; p++) {
  const proj = projectsData[p];
  const client = clientsData.find((c) => c.clientCode === proj.clientCode);
  const currency = client ? countryToCurrency(client.country) : 'USD';

  const inv1Issue = proj.startDate;
  const inv1Due = addDays(inv1Issue, 30);
  const inv1Subtotal = Math.round(proj.revenue * 0.4);
  const inv1Tax = Math.round(inv1Subtotal * 0.18);
  const inv1Total = inv1Subtotal + inv1Tax;

  let inv1Status: InvoiceData['status'];
  let inv1Paid: Date | null = null;
  let inv1PaidAmount = 0;

  if (proj.status === 'DELIVERED' || proj.status === 'CLOSED' || proj.status === 'MAINTENANCE') {
    inv1Status = 'PAID';
    inv1Paid = addDays(inv1Due, -3);
    inv1PaidAmount = inv1Total;
  } else if (proj.status === 'ON_HOLD') {
    inv1Status = 'OVERDUE';
  } else if (proj.status === 'PLANNING' || proj.status === 'PENDING') {
    inv1Status = 'DRAFT';
  } else {
    inv1Status = 'SENT';
  }

  invoicesData.push({
    invoiceNumber: 'INV-' + proj.projectCode.slice(-3) + '-001',
    clientCode: proj.clientCode,
    projectCode: proj.projectCode,
    issueDate: inv1Issue,
    dueDate: inv1Due,
    paidDate: inv1Paid,
    subtotal: inv1Subtotal,
    taxAmount: inv1Tax,
    total: inv1Total,
    currency,
    status: inv1Status,
    paidAmount: inv1PaidAmount,
  });

  if (proj.progressPercent >= 80) {
    const inv2Issue = addDays(proj.startDate, 90);
    const inv2Due = addDays(inv2Issue, 30);
    const inv2Subtotal = Math.round(proj.revenue * 0.6);
    const inv2Tax = Math.round(inv2Subtotal * 0.18);
    const inv2Total = inv2Subtotal + inv2Tax;

    let inv2Status: InvoiceData['status'];
    let inv2Paid: Date | null = null;
    let inv2PaidAmount = 0;

    if (proj.status === 'DELIVERED' || proj.status === 'CLOSED' || proj.status === 'MAINTENANCE') {
      inv2Status = 'PAID';
      inv2Paid = addDays(inv2Due, -1);
      inv2PaidAmount = inv2Total;
    } else if (proj.status === 'QA' || proj.status === 'DEPLOYMENT') {
      inv2Status = 'SENT';
    } else {
      inv2Status = 'DRAFT';
    }

    invoicesData.push({
      invoiceNumber: 'INV-' + proj.projectCode.slice(-3) + '-002',
      clientCode: proj.clientCode,
      projectCode: proj.projectCode,
      issueDate: inv2Issue,
      dueDate: inv2Due,
      paidDate: inv2Paid,
      subtotal: inv2Subtotal,
      taxAmount: inv2Tax,
      total: inv2Total,
      currency,
      status: inv2Status,
      paidAmount: inv2PaidAmount,
    });
  }
}

if (projectMembersData.length !== 60 * 5) throw new Error('Expected 300 project members, got ' + projectMembersData.length);
if (projectTasksData.length !== 60 * 3) throw new Error('Expected 180 project tasks, got ' + projectTasksData.length);
if (projectMilestonesData.length !== 60 * 4) throw new Error('Expected 240 project milestones, got ' + projectMilestonesData.length);
if (projectRisksData.length !== 60) throw new Error('Expected 60 project risks');
if (invoicesData.length < 60) throw new Error('Expected at least 60 invoices, got ' + invoicesData.length);
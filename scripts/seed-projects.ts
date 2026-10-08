// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Projects seeder (Section 11 Part 3)
// Inserts: Client, ClientContact, Contract, Project, ProjectMember,
//          ProjectTask, ProjectMilestone, ProjectRisk, Invoice.
// Idempotent: safe to re-run.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { clientsData } from '../database/data/clients.data';
import { projectsData } from '../database/data/projects.data';
import {
  projectMembersData,
  projectTasksData,
  projectMilestonesData,
  projectRisksData,
  invoicesData,
} from '../database/data/delivery.data';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding clients ...');

  for (const c of clientsData) {
    await prisma.client.upsert({
      where: { clientCode: c.clientCode },
      update: {
        companyName: c.companyName,
        country: c.country,
        industry: c.industry,
        contractValue: c.contractValue,
        revenue: c.revenue,
        billingTerms: c.billingTerms,
        slaTier: c.slaTier,
        healthScore: c.healthScore,
        status: c.status,
      },
      create: {
        clientCode: c.clientCode,
        companyName: c.companyName,
        country: c.country,
        industry: c.industry,
        contractValue: c.contractValue,
        revenue: c.revenue,
        billingTerms: c.billingTerms,
        slaTier: c.slaTier,
        healthScore: c.healthScore,
        status: c.status,
      },
    });
  }
  console.log('  [OK] Clients: ' + clientsData.length);

  const allClients = await prisma.client.findMany();
  const clientIdByCode = new Map(allClients.map((c) => [c.clientCode, c.id]));

  let contactCount = 0;
  for (let i = 0; i < clientsData.length; i++) {
    const c = clientsData[i];
    const clientId = clientIdByCode.get(c.clientCode);
    if (!clientId) continue;
    const slug = c.companyName.toLowerCase().replace(/[^a-z]/g, '');
    const email = 'contact.' + slug.slice(0, 10) + '@' + slug.slice(0, 12) + '.example';
    await prisma.clientContact.upsert({
      where: { id: c.clientCode + '-contact-1' },
      update: { fullName: 'Primary Contact', title: 'Procurement Lead', email, isPrimary: true },
      create: {
        id: c.clientCode + '-contact-1',
        clientId,
        fullName: 'Primary Contact',
        title: 'Procurement Lead',
        email,
        phone: '+1-555-' + String(1000000 + i * 137).slice(-7),
        isPrimary: true,
      },
    });
    contactCount++;
  }
  console.log('  [OK] Client contacts: ' + contactCount);

  let contractCount = 0;
  for (let i = 0; i < clientsData.length; i++) {
    const c = clientsData[i];
    const clientId = clientIdByCode.get(c.clientCode);
    if (!clientId) continue;
    await prisma.contract.upsert({
      where: { contractCode: 'CTR-' + c.clientCode.slice(-3) + '-001' },
      update: { value: c.contractValue },
      create: {
        contractCode: 'CTR-' + c.clientCode.slice(-3) + '-001',
        clientId,
        title: 'Master Services Agreement',
        startDate: new Date(Date.UTC(2023, 0, 1 + (i % 28))),
        endDate: new Date(Date.UTC(2025, 11, 31)),
        value: c.contractValue,
        currency: c.country === 'India' ? 'INR' : 'USD',
        terms: 'Standard MSA',
        status: 'ACTIVE',
      },
    });
    contractCount++;
  }
  console.log('  [OK] Contracts: ' + contractCount);

  const locations = await prisma.location.findMany();
  const teams = await prisma.team.findMany();
  const locByCode = new Map(locations.map((l) => [l.code, l.id]));
  const teamByCode = new Map(teams.map((t) => [t.code, t.id]));

  console.log('>> Seeding projects ...');
  for (const p of projectsData) {
    const clientId = clientIdByCode.get(p.clientCode);
    if (!clientId) throw new Error('Missing client ' + p.clientCode);
    const locCode = ['PUNE','BLR','NOIDA'][(p.projectCode.charCodeAt(6) + p.projectCode.charCodeAt(7)) % 3];
    const locationId = locByCode.get(locCode) || null;
    const teamCode = ['TEAM-FS-1','TEAM-FS-2','TEAM-PAY','TEAM-LEND','TEAM-AI-RAG','TEAM-DATA-1'][p.projectCode.charCodeAt(7) % 6];
    const teamId = teamByCode.get(teamCode) || null;

    await prisma.project.upsert({
      where: { projectCode: p.projectCode },
      update: {
        name: p.name,
        status: p.status,
        progressPercent: p.progressPercent,
        budget: p.budget,
        revenue: p.revenue,
        cost: p.cost,
        profit: p.profit,
        healthScore: p.healthScore,
        riskScore: p.riskScore,
        securityStatus: p.securityStatus,
        qaStatus: p.qaStatus,
        actualEndDate: p.actualEndDate,
      },
      create: {
        projectCode: p.projectCode,
        name: p.name,
        clientId,
        industry: p.industry,
        country: p.country,
        startDate: p.startDate,
        expectedEndDate: p.expectedEndDate,
        actualEndDate: p.actualEndDate,
        status: p.status,
        progressPercent: p.progressPercent,
        budget: p.budget,
        revenue: p.revenue,
        cost: p.cost,
        profit: p.profit,
        techFrontend: p.techFrontend,
        techBackend: p.techBackend,
        techDatabase: p.techDatabase,
        techCloud: p.techCloud,
        techAI: p.techAI,
        apiStyle: p.apiStyle,
        integrations: p.integrations,
        repository: p.repository,
        environment: p.environment,
        healthScore: p.healthScore,
        riskScore: p.riskScore,
        securityStatus: p.securityStatus,
        qaStatus: p.qaStatus,
        locationId,
        teamId,
      },
    });
  }
  console.log('  [OK] Projects: ' + projectsData.length);

  const allEmps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(allEmps.map((e) => [e.employeeCode, e.id]));

  const allProj = await prisma.project.findMany({ select: { id: true, projectCode: true } });
  const projIdByCode = new Map(allProj.map((p) => [p.projectCode, p.id]));

  let memberCount = 0;
  for (const m of projectMembersData) {
    const projectId = projIdByCode.get(m.projectCode);
    const employeeId = empIdByCode.get(m.employeeCode);
    if (!projectId || !employeeId) continue;
    try {
      await prisma.projectMember.upsert({
        where: { projectId_employeeId: { projectId, employeeId } },
        update: { role: m.role, allocation: m.allocation },
        create: { projectId, employeeId, role: m.role, allocation: m.allocation },
      });
      memberCount++;
    } catch (_e) { /* ignore */ }
  }
  console.log('  [OK] Project members: ' + memberCount);

  let taskCount = 0;
  for (const t of projectTasksData) {
    const projectId = projIdByCode.get(t.projectCode);
    if (!projectId) continue;
    const assigneeId = empIdByCode.get(t.assigneeCode) || null;
    await prisma.projectTask.upsert({
      where: { taskCode: t.taskCode },
      update: { status: t.status, spentHrs: t.spentHrs, completedAt: t.completedAt },
      create: {
        taskCode: t.taskCode,
        projectId,
        title: t.title,
        description: t.description,
        assigneeId,
        status: t.status,
        priority: t.priority,
        estimateHrs: t.estimateHrs,
        spentHrs: t.spentHrs,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
      },
    });
    taskCount++;
  }
  console.log('  [OK] Project tasks: ' + taskCount);

  let milestoneCount = 0;
  for (const ms of projectMilestonesData) {
    const projectId = projIdByCode.get(ms.projectCode);
    if (!projectId) continue;
    const existing = await prisma.projectMilestone.findFirst({
      where: { projectId, title: ms.title },
    });
    if (existing) {
      await prisma.projectMilestone.update({
        where: { id: existing.id },
        data: { status: ms.status, completedAt: ms.completedAt },
      });
    } else {
      await prisma.projectMilestone.create({
        data: {
          projectId,
          title: ms.title,
          dueDate: ms.dueDate,
          completedAt: ms.completedAt,
          status: ms.status,
        },
      });
    }
    milestoneCount++;
  }
  console.log('  [OK] Project milestones: ' + milestoneCount);

  let riskCount = 0;
  for (const r of projectRisksData) {
    const projectId = projIdByCode.get(r.projectCode);
    if (!projectId) continue;
    const existing = await prisma.projectRisk.findFirst({
      where: { projectId, title: r.title },
    });
    if (!existing) {
      await prisma.projectRisk.create({
        data: {
          projectId,
          title: r.title,
          description: r.description,
          severity: r.severity,
          probability: r.probability,
          impact: r.impact,
          mitigation: r.mitigation,
          status: r.status,
        },
      });
    }
    riskCount++;
  }
  console.log('  [OK] Project risks: ' + riskCount);

  let invoiceCount = 0;
  for (const inv of invoicesData) {
    const clientId = clientIdByCode.get(inv.clientCode);
    const projectId = projIdByCode.get(inv.projectCode) || null;
    if (!clientId) continue;
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: {
        status: inv.status,
        paidAmount: inv.paidAmount,
        paidDate: inv.paidDate,
      },
      create: {
        invoiceNumber: inv.invoiceNumber,
        clientId,
        projectId,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        paidDate: inv.paidDate,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        total: inv.total,
        currency: inv.currency,
        status: inv.status,
        paidAmount: inv.paidAmount,
      },
    });
    invoiceCount++;
  }
  console.log('  [OK] Invoices: ' + invoiceCount);

  console.log('Projects seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Operations seeder (Section 11 Part 4F)
// Inserts: SecurityEvent, AuditLog, Notification, CalendarEvent,
//          AutomationRule, Kpi, KpiSnapshot, Document, KnowledgeArticle.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { securityEventsData } from '../database/data/security-events.data';
import { auditLogsData } from '../database/data/audit-logs.data';
import { notificationsData } from '../database/data/notifications.data';
import { calendarEventsData } from '../database/data/calendar-events.data';
import { automationRulesData } from '../database/data/automation-rules.data';
import { kpisData, kpiSnapshotsData } from '../database/data/kpis.data';
import { documentsData } from '../database/data/documents.data';
import { knowledgeArticlesData } from '../database/data/knowledge.data';

const prisma = new PrismaClient();

async function main() {
  // ---- SecurityEvents ----
  console.log('>> Seeding security events ...');
  let secCount = 0;
  for (const s of securityEventsData) {
    await prisma.securityEvent.upsert({
      where: { eventCode: s.eventCode },
      update: { status: s.status, resolvedAt: s.resolvedAt },
      create: {
        eventCode: s.eventCode,
        category: s.category,
        severity: s.severity,
        title: s.title,
        description: s.description,
        source: s.source,
        affectedAsset: s.affectedAsset,
        status: s.status,
        resolvedAt: s.resolvedAt,
        createdAt: s.createdAt,
      },
    });
    secCount++;
  }
  console.log('  [OK] SecurityEvents: ' + secCount);

  // ---- AuditLogs ----
  console.log('>> Seeding audit logs ...');
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]));

  let audCount = 0;
  for (const a of auditLogsData) {
    const userId = userIdByEmail.get(a.userEmail) || null;
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: a.userEmail,
        action: a.action,
        module: a.module,
        recordId: a.recordId,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt,
      },
    });
    audCount++;
  }
  console.log('  [OK] AuditLogs: ' + audCount);

  // ---- Notifications ----
  console.log('>> Seeding notifications ...');
  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));
  const userByEmail = new Map(users.map((u) => [u.email, u.id]));

  let notifCount = 0;
  let notifSkip = 0;
  for (const n of notificationsData) {
    const userId = userByEmail.get(n.userEmail);
    const employeeId = empIdByCode.get(n.employeeCode) || null;
    if (!userId) { notifSkip++; continue; }
    await prisma.notification.create({
      data: {
        userId,
        employeeId,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt,
      },
    });
    notifCount++;
  }
  console.log('  [OK] Notifications: ' + notifCount + ' (skipped: ' + notifSkip + ')');

  // ---- CalendarEvents ----
  console.log('>> Seeding calendar events ...');
  let calCount = 0;
  for (const c of calendarEventsData) {
    await prisma.calendarEvent.create({
      data: {
        title: c.title,
        description: c.description,
        category: c.category,
        startAt: c.startAt,
        endAt: c.endAt,
        allDay: c.allDay,
        location: c.location,
      },
    });
    calCount++;
  }
  console.log('  [OK] CalendarEvents: ' + calCount);

  // ---- AutomationRules ----
  console.log('>> Seeding automation rules ...');
  let autoCount = 0;
  for (const r of automationRulesData) {
    await prisma.automationRule.upsert({
      where: { code: r.code },
      update: { name: r.name, isEnabled: r.isEnabled },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        trigger: r.trigger,
        triggerExpr: r.triggerExpr,
        action: r.action,
        isEnabled: r.isEnabled,
      },
    });
    autoCount++;
  }
  console.log('  [OK] AutomationRules: ' + autoCount);

  // ---- KPIs + Snapshots ----
  console.log('>> Seeding KPIs ...');
  let kpiCount = 0;
  for (const k of kpisData) {
    const kpi = await prisma.kpi.upsert({
      where: { code: k.code },
      update: {
        currentValue: k.currentValue,
        trend: k.trend,
      },
      create: {
        code: k.code,
        name: k.name,
        category: k.category,
        unit: k.unit,
        formula: k.formula,
        targetValue: k.targetValue,
        currentValue: k.currentValue,
        trend: k.trend,
      },
    });
    kpiCount++;
  }
  console.log('  [OK] KPIs: ' + kpiCount);

  const allKpis = await prisma.kpi.findMany({ select: { id: true, code: true } });
  const kpiIdByCode = new Map(allKpis.map((k) => [k.code, k.id]));

  let snapCount = 0;
  for (const s of kpiSnapshotsData) {
    const kpiId = kpiIdByCode.get(s.kpiCode);
    if (!kpiId) continue;
    await prisma.kpiSnapshot.create({
      data: { kpiId, value: s.value, capturedAt: new Date() },
    });
    snapCount++;
  }
  console.log('  [OK] KpiSnapshots: ' + snapCount);

  // ---- Documents ----
  console.log('>> Seeding documents ...');
  let docCount = 0;
  for (const d of documentsData) {
    const ownerId = d.ownerCode ? empIdByCode.get(d.ownerCode) || null : null;
    await prisma.document.upsert({
      where: { documentCode: d.documentCode },
      update: { title: d.title, version: d.version },
      create: {
        documentCode: d.documentCode,
        title: d.title,
        category: d.category,
        mimeType: d.mimeType,
        sizeBytes: d.sizeBytes,
        storageUrl: d.storageUrl,
        ownerId,
        accessLevel: d.accessLevel,
        tags: d.tags,
        version: d.version,
      },
    });
    docCount++;
  }
  console.log('  [OK] Documents: ' + docCount);

  // ---- KnowledgeArticles ----
  console.log('>> Seeding knowledge articles ...');
  let kCount = 0;
  for (const a of knowledgeArticlesData) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: a.slug },
      update: { title: a.title, viewCount: a.viewCount },
      create: {
        slug: a.slug,
        title: a.title,
        category: a.category,
        body: a.body,
        tags: a.tags,
        published: a.published,
        viewCount: a.viewCount,
      },
    });
    kCount++;
  }
  console.log('  [OK] KnowledgeArticles: ' + kCount);

  console.log('Operations seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
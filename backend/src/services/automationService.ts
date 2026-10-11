import { prisma } from '../config/prisma';

export async function listRules() {
  const rows = await prisma.automationRule.findMany({ orderBy: { code: 'asc' } });
  return rows.map((r) => ({
    id: r.id, code: r.code, name: r.name, description: r.description,
    trigger: r.trigger, triggerExpr: r.triggerExpr, action: r.action,
    isEnabled: r.isEnabled, lastRunAt: r.lastRunAt, lastStatus: r.lastStatus,
  }));
}

export async function listRunLogs(limit = 50) {
  const rows = await prisma.automationRunLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id, ruleCode: r.ruleCode, trigger: r.trigger, status: r.status,
    message: r.message, startedAt: r.startedAt, completedAt: r.completedAt,
  }));
}

export async function toggleRule(id: string, enabled: boolean, actorUserId: string | null) {
  const updated = await prisma.automationRule.update({ where: { id }, data: { isEnabled: enabled } });
  await prisma.auditLog.create({
    data: { userId: actorUserId, action: 'UPDATE', module: 'automation', recordId: id, newValue: { code: updated.code, isEnabled: enabled } as any },
  });
  return { id: updated.id, isEnabled: updated.isEnabled };
}

// Simulate running a rule — writes a run log, does not execute side effects.
export async function simulateRun(ruleCode: string, actorUserId: string | null) {
  const rule = await prisma.automationRule.findUnique({ where: { code: ruleCode } });
  if (!rule) {
    throw Object.assign(new Error('Rule not found'), { status: 404, code: 'NOT_FOUND' });
  }
  const started = new Date();
  await new Promise((res) => setTimeout(res, 250));
  const completed = new Date();
  const log = await prisma.automationRunLog.create({
    data: {
      ruleCode,
      trigger: rule.trigger,
      status: 'SUCCESS',
      message: 'Prototype simulation — no side effects executed',
      startedAt: started,
      completedAt: completed,
    },
  });
  await prisma.automationRule.update({
    where: { id: rule.id },
    data: { lastRunAt: completed, lastStatus: 'SUCCESS' },
  });
  await prisma.auditLog.create({
    data: { userId: actorUserId, action: 'UPDATE', module: 'automation', recordId: rule.id, newValue: { event: 'SIMULATED_RUN', code: ruleCode } as any },
  });
  return { id: log.id, ruleCode, status: log.status, startedAt: log.startedAt, completedAt: log.completedAt };
}

export async function ensureNewRules() {
  const extra = [
    { code: 'AUTO-MILESTONE-REM', name: 'Milestone reminder', description: 'Remind PM 3 days before milestone due date.', trigger: 'SCHEDULE', triggerExpr: '0 8 * * *', action: 'NOTIFY_PM', isEnabled: true },
    { code: 'AUTO-BUDGET-ALERT',  name: 'Budget alert',       description: 'Alert finance when project spend exceeds 90% of budget.', trigger: 'EVENT', triggerExpr: 'project.budget.over90', action: 'ALERT_FINANCE', isEnabled: true },
    { code: 'AUTO-DEADLINE-ALERT',name: 'Deadline alert',     description: 'Alert project manager when task is due in 48 hours.', trigger: 'SCHEDULE', triggerExpr: '0 8 * * *', action: 'ALERT_PM', isEnabled: true },
    { code: 'AUTO-ONBOARD-REM',   name: 'Onboarding task reminder', description: 'Remind HR of pending onboarding tasks after 3 days.', trigger: 'SCHEDULE', triggerExpr: '0 9 * * *', action: 'NOTIFY_HR', isEnabled: true },
    { code: 'AUTO-OFFER-EXPIRY',  name: 'Offer expiry reminder', description: 'Alert recruiter 1 day before offer expires.', trigger: 'SCHEDULE', triggerExpr: '0 10 * * *', action: 'NOTIFY_RECRUITER', isEnabled: true },
    { code: 'AUTO-SEC-ESCALATE',  name: 'Security incident escalation', description: 'Escalate critical security event to on-call engineer.', trigger: 'EVENT', triggerExpr: 'security.critical', action: 'PAGE_ONCALL', isEnabled: true },
  ];
  let created = 0;
  for (const e of extra) {
    const exists = await prisma.automationRule.findUnique({ where: { code: e.code } });
    if (!exists) {
      await prisma.automationRule.create({ data: e });
      created++;
    }
  }
  return { created, total: extra.length };
}
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListAuditParams {
  page: number; pageSize: number;
  search?: string; action?: string; module?: string;
  userEmail?: string; from?: string; to?: string;
}

export async function listAuditLogs(params: ListAuditParams) {
  const { page, pageSize, search, action, module, userEmail, from, to } = params;
  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action;
  if (module) where.module = module;
  if (userEmail) where.userEmail = userEmail;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as any).gte = new Date(from);
    if (to) (where.createdAt as any).lte = new Date(to);
  }
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { userEmail: { contains: q, mode: 'insensitive' } },
      { module: { contains: q, mode: 'insensitive' } },
      { action: { contains: q, mode: 'insensitive' } },
      { recordId: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true } } },
    }),
  ]);

  const items = rows.map((a) => ({
    id: a.id,
    userEmail: a.userEmail,
    userName: a.user?.fullName || null,
    userId: a.userId,
    action: a.action,
    module: a.module,
    recordId: a.recordId,
    oldValue: a.oldValue,
    newValue: a.newValue,
    ipAddress: a.ipAddress,
    userAgent: a.userAgent,
    createdAt: a.createdAt,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getAuditSummary() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 3600 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const [total, last24hCount, last7dCount, byAction, byModule, topUsers] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: last24h } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: last7d } } }),
    prisma.auditLog.groupBy({ by: ['action'], _count: { _all: true } }),
    prisma.auditLog.groupBy({ by: ['module'], _count: { _all: true } }),
    prisma.auditLog.groupBy({ by: ['userEmail'], _count: { _all: true }, orderBy: { _count: { userEmail: 'desc' } }, take: 10 }),
  ]);

  return {
    total,
    last24h: last24hCount,
    last7d: last7dCount,
    byAction: byAction.map((a) => ({ action: a.action, count: a._count._all })).sort((a, b) => b.count - a.count),
    byModule: byModule.map((m) => ({ module: m.module, count: m._count._all })).sort((a, b) => b.count - a.count),
    topUsers: topUsers.map((u) => ({ userEmail: u.userEmail, count: u._count._all })),
  };
}
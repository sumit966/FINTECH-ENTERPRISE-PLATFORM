import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export async function listEvents(params: { page: number; pageSize: number; search?: string; category?: string; severity?: string; status?: string }) {
  const { page, pageSize, search, category, severity, status } = params;
  const where: Prisma.SecurityEventWhereInput = {};
  if (category) where.category = category;
  if (severity) where.severity = severity;
  if (status) where.status = status;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { eventCode: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.securityEvent.count({ where }),
    prisma.securityEvent.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  const items = rows.map((e) => ({
    id: e.id, eventCode: e.eventCode, category: e.category, severity: e.severity,
    title: e.title, description: e.description, source: e.source,
    affectedAsset: e.affectedAsset, status: e.status,
    resolvedAt: e.resolvedAt, createdAt: e.createdAt,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getSecuritySummary() {
  const [total, bySeverity, byCategory, byStatus, recent] = await Promise.all([
    prisma.securityEvent.count(),
    prisma.securityEvent.groupBy({ by: ['severity'], _count: { _all: true } }),
    prisma.securityEvent.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.securityEvent.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.securityEvent.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
  ]);

  const openCount = byStatus.find((s) => s.status === 'OPEN')?._count._all ?? 0;
  const criticalCount = bySeverity.find((s) => s.severity === 'CRITICAL')?._count._all ?? 0;
  const resolvedCount = byStatus.find((s) => s.status === 'RESOLVED')?._count._all ?? 0;
  const securityScore = total > 0 ? Math.max(0, 100 - (openCount * 2) - (criticalCount * 5)) : 100;

  return {
    total,
    openCount,
    resolvedCount,
    criticalCount,
    securityScore,
    bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count._all })),
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    recent: recent.map((r) => ({
      id: r.id, eventCode: r.eventCode, title: r.title, severity: r.severity,
      category: r.category, status: r.status, createdAt: r.createdAt,
    })),
  };
}
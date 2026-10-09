import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListDocumentsParams {
  page: number; pageSize: number; search?: string; category?: string; accessLevel?: string;
}

export async function listDocuments(params: ListDocumentsParams) {
  const { page, pageSize, search, category, accessLevel } = params;
  const where: Prisma.DocumentWhereInput = {};
  if (category) where.category = category;
  if (accessLevel) where.accessLevel = accessLevel;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { documentCode: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { owner: { fullName: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, employeeCode: true, fullName: true } } },
    }),
  ]);
  const items = rows.map((d) => ({
    id: d.id, documentCode: d.documentCode, title: d.title, category: d.category,
    mimeType: d.mimeType, sizeBytes: d.sizeBytes, storageUrl: d.storageUrl,
    accessLevel: d.accessLevel, tags: d.tags, version: d.version,
    ownerId: d.owner?.id || null, ownerCode: d.owner?.employeeCode || null, ownerName: d.owner?.fullName || null,
    createdAt: d.createdAt, updatedAt: d.updatedAt,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getDocumentsSummary() {
  const [total, byCategory, byAccessLevel, sizeAgg] = await Promise.all([
    prisma.document.count(),
    prisma.document.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.document.groupBy({ by: ['accessLevel'], _count: { _all: true } }),
    prisma.document.aggregate({ _sum: { sizeBytes: true } }),
  ]);
  return {
    total,
    totalSizeBytes: Number(sizeAgg._sum.sizeBytes || 0),
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })),
    byAccessLevel: byAccessLevel.map((a) => ({ accessLevel: a.accessLevel, count: a._count._all })),
  };
}
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListAssetsParams {
  page: number; pageSize: number; search?: string;
  type?: string; status?: string; locationCode?: string;
}

export async function listAssets(params: ListAssetsParams) {
  const { page, pageSize, search, type, status, locationCode } = params;
  const where: Prisma.AssetWhereInput = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { assetCode: { contains: q, mode: 'insensitive' } },
      { serialNumber: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
      { assignedTo: { fullName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { assetCode: 'asc' },
      include: {
        assignedTo: {
          select: {
            id: true, employeeCode: true, fullName: true,
            location: { select: { code: true, city: true } },
          },
        },
      },
    }),
  ]);

  const items = rows.map((a) => ({
    id: a.id,
    assetCode: a.assetCode,
    type: a.type,
    brand: a.brand,
    model: a.model,
    serialNumber: a.serialNumber,
    assignedToId: a.assignedTo?.id || null,
    assignedToCode: a.assignedTo?.employeeCode || null,
    assignedToName: a.assignedTo?.fullName || null,
    locationCode: a.assignedTo?.location?.code || null,
    locationCity: a.assignedTo?.location?.city || null,
    purchasedAt: a.purchasedAt,
    warrantyUntil: a.warrantyUntil,
    status: a.status,
    cost: Number(a.cost),
  }));
  return paginated(items, page, pageSize, total);
}

export async function getAssetsSummary() {
  const [total, byType, byStatus, costAgg, warranty] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['type'], _count: { _all: true }, _sum: { cost: true } }),
    prisma.asset.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.asset.aggregate({ _sum: { cost: true }, _avg: { cost: true } }),
    prisma.asset.count({
      where: { warrantyUntil: { lt: new Date(Date.now() + 90 * 24 * 3600 * 1000) } },
    }),
  ]);
  return {
    total,
    totalValue: Number(costAgg._sum.cost || 0),
    avgCost: Number(costAgg._avg.cost || 0),
    expiringWarrantyCount: warranty,
    byType: byType.map((t) => ({ type: t.type, count: t._count._all, totalValue: Number(t._sum.cost || 0) })).sort((a, b) => b.count - a.count),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
  };
}
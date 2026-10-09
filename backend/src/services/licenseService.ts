import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export async function listLicenses(params: { page: number; pageSize: number; search?: string; status?: string }) {
  const { page, pageSize, search, status } = params;
  const where: Prisma.LicenseWhereInput = {};
  if (status) where.status = status;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { licenseCode: { contains: q, mode: 'insensitive' } },
      { product: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.license.count({ where }),
    prisma.license.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { product: 'asc' } }),
  ]);

  const now = Date.now();
  const items = rows.map((l) => {
    const daysToRenewal = Math.floor((l.renewalAt.getTime() - now) / (24 * 3600 * 1000));
    return {
      id: l.id, licenseCode: l.licenseCode, product: l.product, vendorId: l.vendorId,
      seats: l.seats, usedSeats: l.usedSeats, costPerSeat: Number(l.costPerSeat),
      currency: l.currency, totalCost: Number(l.costPerSeat) * l.seats,
      purchasedAt: l.purchasedAt, renewalAt: l.renewalAt, status: l.status,
      utilisation: l.seats > 0 ? Math.round((l.usedSeats / l.seats) * 100) : 0,
      daysToRenewal,
    };
  });
  return paginated(items, page, pageSize, total);
}

export async function getLicensesSummary() {
  const [total, byStatus, activeAgg, expiring] = await Promise.all([
    prisma.license.count(),
    prisma.license.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.license.findMany({ select: { seats: true, usedSeats: true, costPerSeat: true } }),
    prisma.license.count({ where: { renewalAt: { lt: new Date(Date.now() + 60 * 24 * 3600 * 1000) } } }),
  ]);
  let totalSeats = 0, usedSeats = 0, totalCost = 0;
  for (const l of activeAgg) {
    totalSeats += l.seats;
    usedSeats += l.usedSeats;
    totalCost += Number(l.costPerSeat) * l.seats;
  }
  return {
    total,
    totalSeats,
    usedSeats,
    overallUtilisation: totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0,
    totalCost,
    expiringIn60Days: expiring,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
  };
}
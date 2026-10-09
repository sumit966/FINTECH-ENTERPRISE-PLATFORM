import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export async function listVendors(params: { page: number; pageSize: number; search?: string; category?: string; status?: string; country?: string }) {
  const { page, pageSize, search, category, status, country } = params;
  const where: Prisma.VendorWhereInput = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (country) where.country = country;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { vendorCode: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { vendorCode: 'asc' },
      include: { _count: { select: { purchaseOrders: true } } },
    }),
  ]);

  const items = rows.map((v) => ({
    id: v.id, vendorCode: v.vendorCode, name: v.name, category: v.category,
    contactName: v.contactName, email: v.email, phone: v.phone,
    country: v.country, gstNumber: v.gstNumber, status: v.status,
    rating: v.rating ? Number(v.rating) : null,
    poCount: v._count.purchaseOrders,
  }));
  return paginated(items, page, pageSize, total);
}

export async function listPurchaseOrders(params: { page: number; pageSize: number; search?: string; status?: string; vendorCode?: string }) {
  const { page, pageSize, search, status, vendorCode } = params;
  const where: Prisma.PurchaseOrderWhereInput = {};
  if (status) where.status = status;
  if (vendorCode) where.vendor = { vendorCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { poNumber: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { vendor: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.purchaseOrder.count({ where }),
    prisma.purchaseOrder.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { issuedAt: 'desc' },
      include: { vendor: { select: { vendorCode: true, name: true, country: true } } },
    }),
  ]);

  const items = rows.map((p) => ({
    id: p.id, poNumber: p.poNumber, title: p.title, description: p.description,
    amount: Number(p.amount), currency: p.currency,
    issuedAt: p.issuedAt, deliveredAt: p.deliveredAt, status: p.status,
    vendorCode: p.vendor.vendorCode, vendorName: p.vendor.name, vendorCountry: p.vendor.country,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getVendorsSummary() {
  const [total, byCategory, byCountry, byStatus, poTotal, poValue] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.vendor.groupBy({ by: ['country'], _count: { _all: true } }),
    prisma.vendor.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.purchaseOrder.count(),
    prisma.purchaseOrder.aggregate({ _sum: { amount: true } }),
  ]);
  return {
    total, poTotal,
    totalPoValue: Number(poValue._sum.amount || 0),
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })).sort((a, b) => b.count - a.count),
    byCountry: byCountry.map((c) => ({ country: c.country, count: c._count._all })).sort((a, b) => b.count - a.count),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
  };
}